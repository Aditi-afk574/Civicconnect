package com.localresolve.dto.issue;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDateTime createdAt;
}
