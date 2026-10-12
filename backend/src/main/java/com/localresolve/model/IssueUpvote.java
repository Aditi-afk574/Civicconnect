package com.localresolve.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "issue_upvotes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "issue_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "issue_id", nullable = false)
    private Long issueId;
}
