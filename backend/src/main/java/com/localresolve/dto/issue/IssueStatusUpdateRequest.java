package com.localresolve.dto.issue;

import com.localresolve.model.enums.IssueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IssueStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private IssueStatus status;

    private String comment;
    private Long assignedToId;
}
