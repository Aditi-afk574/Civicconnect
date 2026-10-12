import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyIssues } from '../api/issueApi';
import { Link } from 'react-router-dom';
import { StatusBadge, CategoryBadge } from '../components/IssueCard';
import BadgeSystem from '../components/BadgeSystem';

const Profile = () => {
    const { user } = useAuth();
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyIssues().then(r => setIssues(r.data || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const stats = {
        total: issues.length,
        open: issues.filter(i => i.status === 'OPEN').length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
        inProgress: issues.filter(i => i.status === 'IN_PROGRESS').length,
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 860 }}>
                {/* Profile Header */}
                <div className="card" style={{ marginBottom: 24, padding: 32 }}>
                    <div className="flex items-center gap-4">
                        <div style={{ width: 72, height: 72, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {user?.profileImage
                                ? <img src={user.profileImage} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
                                : user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem' }}>{user?.name}</h1>
                            <p className="text-muted">{user?.email}</p>
                            <span className={`badge ${user?.role === 'ADMIN' ? 'badge-in_progress' : 'badge-resolved'}`} style={{ marginTop: 8 }}>
                                {user?.role}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid-4" style={{ marginBottom: 28 }}>
                    {[
                        { label: 'Total Reports', value: stats.total, color: 'var(--primary-light)' },
                        { label: 'Open', value: stats.open, color: '#60a5fa' },
                        { label: 'In Progress', value: stats.inProgress, color: '#fbbf24' },
                        { label: 'Resolved', value: stats.resolved, color: '#34d399' },
                    ].map(s => (
                        <div key={s.label} className="card text-center" style={{ padding: 20 }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div className="text-muted text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Badges */}
                {!loading && <BadgeSystem issues={issues} />}

                {/* My Issues */}
                <h2 style={{ marginBottom: 16 }}>My Reported Issues</h2>
                {loading ? <div className="spinner" /> : issues.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {issues.map(issue => (
                            <Link key={issue.id} to={`/issues/${issue.id}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{ padding: '16px 20px' }}>
                                    <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                                        <div>
                                            <div className="flex gap-2 items-center" style={{ marginBottom: 6, flexWrap: 'wrap' }}>
                                                <CategoryBadge category={issue.category} />
                                                <StatusBadge status={issue.status} />
                                            </div>
                                            <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{issue.title}</h3>
                                            <p className="text-muted text-sm">📍 {issue.location}</p>
                                        </div>
                                        <div className="text-muted text-sm text-center" style={{ flexShrink: 0 }}>
                                            <div>👍 {issue.upvotes}</div>
                                            <div>💬 {issue.comments?.length || 0}</div>
                                            <div>{new Date(issue.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center" style={{ padding: 48 }}>
                        <p style={{ fontSize: '2.5rem' }}>📋</p>
                        <h3>No issues reported yet</h3>
                        <p className="text-muted" style={{ marginBottom: 16 }}>Start contributing to your community!</p>
                        <Link to="/report" className="btn btn-primary">Report an Issue</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
