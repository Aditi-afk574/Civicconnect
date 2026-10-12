import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminIssues, updateIssueStatus } from '../../api/adminApi';
import { StatusBadge } from '../../components/IssueCard';
import { toast } from 'react-toastify';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const CATEGORIES = ['', 'POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAKAGE', 'OTHER'];

const AdminIssues = () => {
    const [issues, setIssues] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', category: '' });
    const [updating, setUpdating] = useState(null);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = { page, size: 15, ...filters };
            if (!params.status) delete params.status;
            if (!params.category) delete params.category;
            const res = await getAdminIssues(params);
            setIssues(res.data.content || []);
            setTotal(res.data.totalElements || 0);
            setTotalPages(res.data.totalPages || 0);
        } catch {
            toast.error('Failed to load issues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIssues(); }, [page, filters]);

    const handleStatusChange = async (issueId, newStatus) => {
        setUpdating(issueId);
        try {
            await updateIssueStatus(issueId, { status: newStatus });
            toast.success('Status updated!');
            fetchIssues();
        } catch { toast.error('Update failed'); }
        finally { setUpdating(null); }
    };

    const handleFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(0); };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div style={{ marginBottom: 24 }}>
                    <h1>📋 Manage Issues <span style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 400 }}>({total})</span></h1>
                </div>

                {/* Filters */}
                <div className="flex gap-3" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 'auto' }}
                        value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
                        <option value="">All Statuses</option>
                        {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 'auto' }}
                        value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
                        <option value="">All Categories</option>
                        {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ status: '', category: '' }); setPage(0); }}>Clear Filters</button>
                </div>

                {loading ? <div className="spinner" /> : (
                    <>
                        <div className="card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                                <thead>
                                    <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid var(--border)' }}>
                                        {['ID', 'Title', 'Category', 'Status', 'Reporter', 'Upvotes', 'Date', 'Actions'].map(h => (
                                            <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {issues.map((issue, i) => (
                                        <tr key={issue.id} style={{ borderBottom: i < issues.length - 1 ? '1px solid var(--border)' : 'none', opacity: updating === issue.id ? 0.5 : 1 }}>
                                            <td style={{ padding: '10px 14px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>#{issue.id}</td>
                                            <td style={{ padding: '10px 14px', maxWidth: 200 }}>
                                                <Link to={`/issues/${issue.id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{issue.title}</Link>
                                            </td>
                                            <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{issue.category?.replace('_', ' ')}</td>
                                            <td style={{ padding: '10px 14px' }}><StatusBadge status={issue.status} /></td>
                                            <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.reporterName}</td>
                                            <td style={{ padding: '10px 14px', color: 'var(--primary-light)', fontWeight: 600 }}>👍 {issue.upvotes}</td>
                                            <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{new Date(issue.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <select
                                                    className="form-select"
                                                    style={{ padding: '4px 8px', fontSize: '0.78rem', width: 130 }}
                                                    value={issue.status}
                                                    disabled={updating === issue.id}
                                                    onChange={e => handleStatusChange(issue.id, e.target.value)}
                                                >
                                                    {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {issues.length === 0 && (
                                <div className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>No issues found for selected filters.</div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2" style={{ marginTop: 20 }}>
                                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                <span className="text-muted" style={{ padding: '6px 12px' }}>{page + 1} / {totalPages}</span>
                                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminIssues;
