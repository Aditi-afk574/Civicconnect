package com.localresolve.dto.issue;

import com.localresolve.model.enums.IssueCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class IssueRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private IssueCategory category;

    @NotBlank(message = "Location is required")
    private String location;

    private BigDecimal latitude;
    private BigDecimal longitude;
}
