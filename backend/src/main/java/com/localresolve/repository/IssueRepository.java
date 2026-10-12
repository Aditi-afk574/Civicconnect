package com.localresolve.repository;

import com.localresolve.model.Issue;
import com.localresolve.model.enums.IssueCategory;
import com.localresolve.model.enums.IssueStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {

    Page<Issue> findByStatus(IssueStatus status, Pageable pageable);

    Page<Issue> findByCategory(IssueCategory category, Pageable pageable);

    Page<Issue> findByStatusAndCategory(IssueStatus status, IssueCategory category, Pageable pageable);

    List<Issue> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(i) FROM Issue i WHERE i.status = :status")
    long countByStatus(@Param("status") IssueStatus status);

    @Query("SELECT i FROM Issue i ORDER BY i.upvotes DESC")
    Page<Issue> findAllOrderByUpvotesDesc(Pageable pageable);
}
