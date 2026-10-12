package com.localresolve.service;

import com.localresolve.dto.issue.CommentResponse;
import com.localresolve.dto.issue.IssueRequest;
import com.localresolve.dto.issue.IssueResponse;
import com.localresolve.dto.issue.IssueStatusUpdateRequest;
import com.localresolve.model.Comment;
import com.localresolve.model.Issue;
import com.localresolve.model.IssueUpvote;
import com.localresolve.model.User;
import com.localresolve.model.enums.IssueCategory;
import com.localresolve.model.enums.IssueStatus;
import com.localresolve.repository.CommentRepository;
import com.localresolve.repository.IssueRepository;
import com.localresolve.repository.IssueUpvoteRepository;
import com.localresolve.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private IssueUpvoteRepository issueUpvoteRepository;

    // ─── Helper: get current logged-in User (null-safe) ───
    private User getCurrentUserOrNull() {
        try {
            String name = SecurityContextHolder.getContext().getAuthentication().getName();
            if (name == null || name.equals("anonymousUser")) return null;
            return userRepository.findByEmail(name).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    // ─── Helper: map Issue → IssueResponse ───
    private IssueResponse toResponse(Issue issue) {
        User currentUser = getCurrentUserOrNull();

        List<CommentResponse> comments = commentRepository
                .findByIssueIdOrderByCreatedAtAsc(issue.getId())
                .stream()
                .map(c -> CommentResponse.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .userId(c.getUser().getId())
                        .userName(c.getUser().getName())
                        .userRole(c.getUser().getRole().name())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        boolean hasUpvoted = currentUser != null &&
                issueUpvoteRepository.existsByUserIdAndIssueId(currentUser.getId(), issue.getId());

        return IssueResponse.builder()
                .id(issue.getId())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .category(issue.getCategory())
                .status(issue.getStatus())
                .imageUrl(issue.getImageUrl())
                .location(issue.getLocation())
                .latitude(issue.getLatitude())
                .longitude(issue.getLongitude())
                .upvotes(issue.getUpvotes())
                .hasUpvoted(hasUpvoted)
                .resolutionImageUrl(issue.getResolutionImageUrl())
                .reporterName(issue.getUser().getName())
                .reporterId(issue.getUser().getId())
                .assignedToName(issue.getAssignedTo() != null ? issue.getAssignedTo().getName() : null)
                .assignedToId(issue.getAssignedTo() != null ? issue.getAssignedTo().getId() : null)
                .comments(comments)
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }

    // ─── Create Issue ───
    public IssueResponse createIssue(IssueRequest request, MultipartFile image) {
        User currentUser = getCurrentUser();

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.storeFile(image);
            imageUrl = "/api/files/" + filename;
        }

        Issue issue = Issue.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(IssueStatus.OPEN)
                .imageUrl(imageUrl)
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .upvotes(0)
                .user(currentUser)
                .build();

        return toResponse(issueRepository.save(issue));
    }

    // ─── Get All Issues (paginated, filtered) ───
    public Page<IssueResponse> getAllIssues(IssueStatus status, IssueCategory category,
                                            String sortBy, int page, int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(sortBy != null ? sortBy : "createdAt").descending());

        Page<Issue> issues;
        if (status != null && category != null) {
            issues = issueRepository.findByStatusAndCategory(status, category, pageable);
        } else if (status != null) {
            issues = issueRepository.findByStatus(status, pageable);
        } else if (category != null) {
            issues = issueRepository.findByCategory(category, pageable);
        } else {
            issues = issueRepository.findAll(pageable);
        }

        return issues.map(this::toResponse);
    }

    // ─── Get Single Issue ───
    public IssueResponse getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found with id: " + id));
        return toResponse(issue);
    }

    // ─── Current User's Issues ───
    public List<IssueResponse> getMyIssues() {
        User currentUser = getCurrentUser();
        return issueRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── Upvote Toggle (one vote per user) ───
    @Transactional
    public IssueResponse upvoteIssue(Long id) {
        User currentUser = getCurrentUser();
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));

        boolean alreadyUpvoted = issueUpvoteRepository
                .existsByUserIdAndIssueId(currentUser.getId(), id);

        if (alreadyUpvoted) {
            // Remove upvote (de-upvote)
            issueUpvoteRepository.deleteByUserIdAndIssueId(currentUser.getId(), id);
            issue.setUpvotes(Math.max(0, issue.getUpvotes() - 1));
        } else {
            // Add upvote
            issueUpvoteRepository.save(IssueUpvote.builder()
                    .userId(currentUser.getId())
                    .issueId(id)
                    .build());
            issue.setUpvotes(issue.getUpvotes() + 1);
        }

        return toResponse(issueRepository.save(issue));
    }

    // ─── Admin: Update Status (with optional resolution proof image) ───
    public IssueResponse updateIssueStatus(Long id, IssueStatusUpdateRequest request, MultipartFile resolutionImage) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));

        issue.setStatus(request.getStatus());

        if (request.getAssignedToId() != null) {
            User admin = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("Admin not found: " + request.getAssignedToId()));
            issue.setAssignedTo(admin);
        }

        // Store resolution proof image if provided and status is RESOLVED
        if (resolutionImage != null && !resolutionImage.isEmpty()) {
            String filename = fileStorageService.storeFile(resolutionImage);
            issue.setResolutionImageUrl("/api/files/" + filename);
        }

        issueRepository.save(issue);

        // Add a comment if provided
        if (request.getComment() != null && !request.getComment().isBlank()) {
            User adminUser = getCurrentUser();
            Comment comment = Comment.builder()
                    .content(request.getComment())
                    .issue(issue)
                    .user(adminUser)
                    .build();
            commentRepository.save(comment);
        }

        return toResponse(issue);
    }

    // ─── Add Comment ───
    public CommentResponse addComment(Long issueId, String content) {
        User currentUser = getCurrentUser();
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + issueId));

        Comment comment = Comment.builder()
                .content(content)
                .issue(issue)
                .user(currentUser)
                .build();
        comment = commentRepository.save(comment);

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .userRole(currentUser.getRole().name())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    // ─── Delete Issue ───
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found: " + id));
        issueRepository.delete(issue);
    }

    // ─── Admin Stats ───
    public Map<String, Long> getStats() {
        return Map.of(
                "total", issueRepository.count(),
                "open", issueRepository.countByStatus(IssueStatus.OPEN),
                "inProgress", issueRepository.countByStatus(IssueStatus.IN_PROGRESS),
                "resolved", issueRepository.countByStatus(IssueStatus.RESOLVED),
                "rejected", issueRepository.countByStatus(IssueStatus.REJECTED)
        );
    }
}
