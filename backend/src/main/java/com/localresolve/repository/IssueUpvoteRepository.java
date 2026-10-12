package com.localresolve.repository;

import com.localresolve.model.IssueUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueUpvoteRepository extends JpaRepository<IssueUpvote, Long> {

    boolean existsByUserIdAndIssueId(Long userId, Long issueId);

    void deleteByUserIdAndIssueId(Long userId, Long issueId);

    long countByIssueId(Long issueId);
}
