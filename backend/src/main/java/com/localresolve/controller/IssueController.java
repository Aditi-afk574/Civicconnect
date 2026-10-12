package com.localresolve.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.localresolve.dto.issue.CommentResponse;
import com.localresolve.dto.issue.IssueRequest;
import com.localresolve.dto.issue.IssueResponse;
import com.localresolve.model.enums.IssueCategory;
import com.localresolve.model.enums.IssueStatus;
import com.localresolve.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@Tag(name = "Issues", description = "Issue management APIs for citizens")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @GetMapping
    @Operation(summary = "Get all issues with optional filters and pagination")
    public ResponseEntity<Page<IssueResponse>> getAllIssues(
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssueCategory category,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(issueService.getAllIssues(status, category, sortBy, page, size));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single issue by ID")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a new issue (with optional image)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<IssueResponse> createIssue(
            @RequestPart("issue") String issueJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        IssueRequest request = mapper.readValue(issueJson, IssueRequest.class);
        return ResponseEntity.ok(issueService.createIssue(request, image));
    }

    @PutMapping("/{id}/upvote")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upvote an issue", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<IssueResponse> upvoteIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.upvoteIssue(id));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's reported issues", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<List<IssueResponse>> getMyIssues() {
        return ResponseEntity.ok(issueService.getMyIssues());
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a comment to an issue", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(issueService.addComment(id, body.get("content")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete an issue", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
