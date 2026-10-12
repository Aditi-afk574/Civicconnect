import React from 'react';
import { Link } from 'react-router-dom';
import { upvoteIssue } from '../api/issueApi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CATEGORY_ICONS = {
    POTHOLE: '🕳️',
    STREETLIGHT: '💡',
    GARBAGE: '🗑️',
    WATER_LEAKAGE: '💧',
    OTHER: '🔧',
};

const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status?.toLowerCase()}`}>
        {status?.replace('_', ' ')}
    </span>
);

const CategoryBadge = ({ category }) => (
    <span className={`badge badge-${category?.toLowerCase()}`}>
        {CATEGORY_ICONS[category]} {category?.replace('_', ' ')}
    </span>
);

const IssueCard = ({ issue, onUpvote }) => {
    const { isAuthenticated } = useAuth();
    const [optimisticUpvoted, setOptimisticUpvoted] = React.useState(issue.hasUpvoted);
    const [optimisticCount, setOptimisticCount] = React.useState(issue.upvotes);
    const [busy, setBusy] = React.useState(false);

    const handleUpvote = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated()) { toast.error('Login to upvote'); return; }
        if (busy) return;
        setBusy(true);
        // Optimistic update
        const newUpvoted = !optimisticUpvoted;
        setOptimisticUpvoted(newUpvoted);
        setOptimisticCount(c => newUpvoted ? c + 1 : Math.max(0, c - 1));
        try {
            await upvoteIssue(issue.id);
            if (onUpvote) onUpvote();
        } catch {
            // Revert
            setOptimisticUpvoted(!newUpvoted);
            setOptimisticCount(issue.upvotes);
            toast.error('Failed to upvote');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Link to={`/issues/${issue.id}`} style={{ textDecoration: 'none' }}>
            <article className="card issue-card">
                {issue.imageUrl && (
                    <div className="issue-card-img">
                        <img src={issue.imageUrl?.startsWith('http') ? issue.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${issue.imageUrl}`} alt={issue.title}
                            onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                )}
                <div className="issue-card-body">
                    <div className="flex items-center gap-2" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                        <CategoryBadge category={issue.category} />
                        <StatusBadge status={issue.status} />
                    </div>
                    <h3 className="issue-card-title">{issue.title}</h3>
                    <p className="issue-card-desc">{issue.description}</p>
                    <div className="issue-card-footer">
                        <div className="issue-card-meta">
                            <span>📍 {issue.location}</span>
                            <span>👤 {issue.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-muted text-sm">💬 {issue.comments?.length || 0}</span>
                            <button onClick={handleUpvote} disabled={busy}
                                className={`upvote-btn ${optimisticUpvoted ? 'upvoted' : ''}`}>
                                {optimisticUpvoted ? '👍' : '👍'} {optimisticCount}
                                {optimisticUpvoted && <span style={{ marginLeft: 4, fontSize: '0.7rem' }}>✓</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        </Link>
    );
};

export { StatusBadge, CategoryBadge };
export default IssueCard;
