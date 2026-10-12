package com.localresolve.controller;

import com.localresolve.dto.issue.IssueResponse;
import com.localresolve.dto.issue.IssueStatusUpdateRequest;
import com.localresolve.model.User;
import com.localresolve.model.enums.IssueCategory;
import com.localresolve.model.enums.IssueStatus;
import com.localresolve.repository.UserRepository;
import com.localresolve.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only management APIs")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/issues")
    @Operation(summary = "Get all issues (admin view, paginated with filters)")
    public ResponseEntity<Page<IssueResponse>> getAllIssues(
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssueCategory category,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(issueService.getAllIssues(status, category, sortBy, page, size));
    }

    @PutMapping(value = "/issues/{id}/status", consumes = { "multipart/form-data", "application/json" })
    @Operation(summary = "Update issue status, assign admin, optionally add comment and resolution proof photo")
    public ResponseEntity<IssueResponse> updateIssueStatus(
            @PathVariable Long id,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "resolutionImage", required = false) MultipartFile resolutionImage) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        IssueStatusUpdateRequest request = mapper.readValue(dataJson, IssueStatusUpdateRequest.class);
        return ResponseEntity.ok(issueService.updateIssueStatus(id, request, resolutionImage));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(issueService.getStats());
    }

    @GetMapping("/users")
    @Operation(summary = "Get all registered users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/issues/{id}")
    @Operation(summary = "Admin delete any issue")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
