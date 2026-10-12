package com.localresolve.dto.issue;

import com.localresolve.model.enums.IssueCategory;
import com.localresolve.model.enums.IssueStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class IssueResponse {
    private Long id;
    private String title;
    private String description;
    private IssueCategory category;
    private IssueStatus status;
    private String imageUrl;
    private String resolutionImageUrl;
    private String location;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer upvotes;
    private boolean hasUpvoted;
    private String reporterName;
    private Long reporterId;
    private String assignedToName;
    private Long assignedToId;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
