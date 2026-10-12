import React, { useState, useEffect } from 'react';
import { getAllIssues } from '../api/issueApi';
import IssueCard from '../components/IssueCard';

const CATEGORIES = ['', 'POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAKAGE', 'OTHER'];
const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

const IssueList = () => {
    const [issues, setIssues] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({ status: '', category: '', sortBy: 'createdAt' });

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = { page, size: 9, ...filters };
            if (!params.status) delete params.status;
            if (!params.category) delete params.category;
            const res = await getAllIssues(params);
            setIssues(res.data.content || []);
            setTotal(res.data.totalElements || 0);
            setTotalPages(res.data.totalPages || 0);
        } catch {
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchIssues(); }, [page, filters]);

    const handleFilter = (key, val) => {
        setFilters(f => ({ ...f, [key]: val }));
        setPage(0);
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1>Community Issues <span style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 400 }}>({total} total)</span></h1>
                    <p className="text-muted">Browse and upvote issues reported in your community</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
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
                    <select className="form-select" style={{ width: 'auto' }}
                        value={filters.sortBy} onChange={e => handleFilter('sortBy', e.target.value)}>
                        <option value="createdAt">Newest First</option>
                        <option value="upvotes">Most Upvoted</option>
                    </select>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="spinner" />
                ) : issues.length > 0 ? (
                    <>
                        <div className="grid-3">
                            {issues.map(issue => <IssueCard key={issue.id} issue={issue} onUpvote={fetchIssues} />)}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2" style={{ marginTop: 32 }}>
                                <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                                <span className="text-muted" style={{ padding: '6px 12px' }}>Page {page + 1} / {totalPages}</span>
                                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="card text-center" style={{ padding: '60px 30px' }}>
                        <p style={{ fontSize: '3rem' }}>🕳️</p>
                        <h3>No issues found</h3>
                        <p className="text-muted">Try changing the filters or be the first to report!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IssueList;
