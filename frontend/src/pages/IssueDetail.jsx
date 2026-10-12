import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, addComment, upvoteIssue } from '../api/issueApi';
import { updateIssueStatus } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge } from '../components/IssueCard';
import { toast } from 'react-toastify';

const IssueDetail = () => {
    const { id } = useParams();
    const { isAuthenticated, isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusForm, setStatusForm] = useState({ status: '', comment: '' });
    const [resolutionImage, setResolutionImage] = useState(null);
    const resolutionFileRef = React.useRef();

    const fetch = async () => {
        try {
            const res = await getIssueById(id);
            setIssue(res.data);
            setStatusForm(f => ({ ...f, status: res.data.status }));
        } catch { navigate('/issues'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            await addComment(id, comment);
            setComment('');
            toast.success('Comment added!');
            fetch();
        } catch { toast.error('Login to comment'); }
        finally { setSubmitting(false); }
    };

    const [upvoted, setUpvoted] = React.useState(false);
    const [upvoteCount, setUpvoteCount] = React.useState(0);

    useEffect(() => {
        if (issue) {
            setUpvoted(issue.hasUpvoted);
            setUpvoteCount(issue.upvotes);
        }
    }, [issue]);

    const handleUpvote = async () => {
        if (!isAuthenticated()) { toast.error('Login to upvote'); return; }
        const newUpvoted = !upvoted;
        setUpvoted(newUpvoted);
        setUpvoteCount(c => newUpvoted ? c + 1 : Math.max(0, c - 1));
        try { await upvoteIssue(id); }
        catch {
            setUpvoted(!newUpvoted);
            setUpvoteCount(issue.upvotes);
            toast.error('Failed to upvote');
        }
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = issue?.title || 'Community Issue';
        if (navigator.share) {
            try { await navigator.share({ title, url }); } catch { }
        } else {
            navigator.clipboard.writeText(url);
            toast.success('🔗 Link copied to clipboard!');
        }
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateIssueStatus(id, { status: statusForm.status, comment: statusForm.comment }, resolutionImage);
            toast.success('Status updated!');
            setStatusForm(f => ({ ...f, comment: '' }));
            setResolutionImage(null);
            fetch();
        } catch { toast.error('Failed to update status'); }
    };

    if (loading) return <div className="spinner" />;
    if (!issue) return null;

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 860 }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>← Back</button>

                <div className="card" style={{ padding: 32 }}>
                    {/* Image */}
                    {issue.imageUrl && (
                        <img src={issue.imageUrl?.startsWith('http') ? issue.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${issue.imageUrl}`} alt={issue.title}
                            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }} />
                    )}

                    {/* Title & Badges */}
                    <div className="flex gap-2" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
                        <CategoryBadge category={issue.category} />
                        <StatusBadge status={issue.status} />
                    </div>
                    <h1 style={{ fontSize: '1.6rem', marginBottom: 12 }}>{issue.title}</h1>
                    <p className="text-muted" style={{ marginBottom: 20, lineHeight: 1.8 }}>{issue.description}</p>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
                        <div><span className="text-muted text-sm">📍 Location</span><div style={{ fontWeight: 600, marginTop: 4 }}>{issue.location}</div></div>
                        <div><span className="text-muted text-sm">👤 Reporter</span><div style={{ fontWeight: 600, marginTop: 4 }}>{issue.reporterName}</div></div>
                        {issue.assignedToName && <div><span className="text-muted text-sm">🛠️ Assigned To</span><div style={{ fontWeight: 600, marginTop: 4 }}>{issue.assignedToName}</div></div>}
                        <div><span className="text-muted text-sm">📅 Reported</span><div style={{ fontWeight: 600, marginTop: 4 }}>{new Date(issue.createdAt).toLocaleDateString()}</div></div>
                        <button onClick={handleUpvote}
                            className={`upvote-btn ${upvoted ? 'upvoted' : ''}`}
                            style={{ alignSelf: 'flex-end' }}>
                            👍 {upvoteCount} {upvoted ? '✓' : ''} Upvotes
                        </button>
                        <button onClick={handleShare} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-end' }}>🔗 Share</button>
                    </div>

                    {/* Resolution Proof */}
                    {issue.resolutionImageUrl && (
                        <div style={{ marginBottom: 24, padding: 20, background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 12 }}>
                            <h3 style={{ color: '#34d399', marginBottom: 12 }}>✅ Resolution Proof</h3>
                            <img src={issue.resolutionImageUrl?.startsWith('http') ? issue.resolutionImageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${issue.resolutionImageUrl}`} alt="Resolution proof"
                                style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 10 }} />
                        </div>
                    )}

                    {/* Admin Panel */}
                    {isAdmin() && (
                        <div className="card" style={{ background: 'rgba(99,102,241,0.08)', marginBottom: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
                            <h3 style={{ marginBottom: 16 }}>🛡️ Admin Panel</h3>
                            <form onSubmit={handleStatusUpdate}>
                                <div className="form-group">
                                    <label className="form-label">Update Status</label>
                                    <select className="form-select" value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Resolution Comment (optional)</label>
                                    <textarea className="form-textarea" value={statusForm.comment} onChange={e => setStatusForm(f => ({ ...f, comment: e.target.value }))} placeholder="Add a comment about this update..." />
                                </div>
                                {statusForm.status === 'RESOLVED' && (
                                    <div className="form-group">
                                        <label className="form-label">📸 Resolution Proof Photo (optional)</label>
                                        <input ref={resolutionFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                            onChange={e => setResolutionImage(e.target.files[0])} />
                                        <div onClick={() => resolutionFileRef.current.click()}
                                            style={{ border: '2px dashed rgba(52,211,153,0.4)', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', textAlign: 'center', background: 'rgba(52,211,153,0.05)', transition: 'all 0.2s' }}>
                                            {resolutionImage
                                                ? <span style={{ color: '#34d399' }}>✅ {resolutionImage.name}</span>
                                                : <span className="text-muted text-sm">Click to upload proof photo</span>}
                                        </div>
                                    </div>
                                )}
                                <button type="submit" className="btn btn-primary">Update Status</button>
                            </form>
                        </div>
                    )}

                    {/* Comments */}
                    <h3 style={{ marginBottom: 16 }}>💬 Comments ({issue.comments?.length || 0})</h3>
                    {issue.comments?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                            {issue.comments.map(c => (
                                <div key={c.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                                    <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.userName}</span>
                                        <div className="flex gap-2 items-center">
                                            {c.userRole === 'ADMIN' && <span className="badge badge-in_progress">Admin</span>}
                                            <span className="text-sm text-muted">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>{c.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted" style={{ marginBottom: 20 }}>No comments yet. Be the first to comment!</p>
                    )}

                    {/* Add Comment */}
                    {isAuthenticated() ? (
                        <form onSubmit={handleComment}>
                            <div className="form-group">
                                <label className="form-label">Add Comment</label>
                                <textarea className="form-textarea" value={comment}
                                    onChange={e => setComment(e.target.value)} placeholder="Share an update or ask a question..." />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </form>
                    ) : (
                        <p className="text-muted text-sm"><a href="/login">Login</a> to add a comment.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IssueDetail;
