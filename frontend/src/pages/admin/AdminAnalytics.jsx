import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
    AreaChart, Area, CartesianGrid,
} from 'recharts';
import { getAdminStats, getAdminIssues } from '../../api/adminApi';
import { Link } from 'react-router-dom';

const STATUS_COLORS = {
    OPEN: '#60a5fa',
    IN_PROGRESS: '#fbbf24',
    RESOLVED: '#34d399',
    REJECTED: '#f87171',
};
const CATEGORY_COLORS = ['#6366f1', '#f97316', '#34d399', '#60a5fa', '#a78bfa'];

// Group issues by week (last 8 weeks)
function groupByWeek(issues) {
    const now = new Date();
    const weeks = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (7 * (7 - i)));
        return { label: `W${i + 1}`, from: d.getTime(), count: 0 };
    });
    issues.forEach(issue => {
        const t = new Date(issue.createdAt).getTime();
        for (let i = weeks.length - 1; i >= 0; i--) {
            if (t >= weeks[i].from) { weeks[i].count++; break; }
        }
    });
    return weeks.map(w => ({ week: w.label, Issues: w.count }));
}

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getAdminStats(),
            getAdminIssues({ size: 1000 }),
        ]).then(([s, i]) => {
            setStats(s.data);
            setIssues(i.data?.content || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

    // Pie — status breakdown
    const statusData = Object.entries(STATUS_COLORS).map(([status, color]) => ({
        name: status.replace('_', ' '),
        value: issues.filter(i => i.status === status).length,
        color,
    })).filter(d => d.value > 0);

    // Bar — category breakdown
    const catCounts = {};
    issues.forEach(i => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
    const categoryData = Object.entries(catCounts).map(([cat, count]) => ({
        name: cat.replace('_', '\n'),
        Issues: count,
    }));

    // Area — issues over time
    const timeData = groupByWeek(issues);

    const resolutionRate = stats?.total
        ? Math.round((stats.resolved / stats.total) * 100)
        : 0;

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 1100 }}>
                <div style={{ marginBottom: 32 }}>
                    <Link to="/admin" className="btn btn-secondary btn-sm" style={{ marginBottom: 16 }}>← Dashboard</Link>
                    <h1>📊 Analytics</h1>
                    <p className="text-muted">Visual breakdown of all community issues</p>
                </div>

                {/* KPI Strip */}
                <div className="grid-4" style={{ marginBottom: 32 }}>
                    {[
                        { label: 'Total Issues', value: stats?.total || 0, color: 'var(--primary-light)', icon: '📋' },
                        { label: 'Resolution Rate', value: `${resolutionRate}%`, color: '#34d399', icon: '✅' },
                        { label: 'Open Issues', value: stats?.open || 0, color: '#60a5fa', icon: '🔓' },
                        { label: 'In Progress', value: stats?.inProgress || 0, color: '#fbbf24', icon: '⚙️' },
                    ].map(k => (
                        <div key={k.label} className="card text-center" style={{ padding: '20px 16px' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{k.icon}</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                            <div className="text-muted text-sm">{k.label}</div>
                        </div>
                    ))}
                </div>

                {/* Charts Row 1 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    {/* Pie — Status */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 20 }}>Issues by Status</h3>
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center" style={{ padding: 40 }}>No data yet</p>}
                    </div>

                    {/* Bar — Category */}
                    <div className="card" style={{ padding: 24 }}>
                        <h3 style={{ marginBottom: 20 }}>Issues by Category</h3>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={categoryData} margin={{ top: 5, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                                    <Bar dataKey="Issues" radius={[6, 6, 0, 0]}>
                                        {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-muted text-center" style={{ padding: 40 }}>No data yet</p>}
                    </div>
                </div>

                {/* Area — Over Time */}
                <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ marginBottom: 20 }}>Issues Reported Over Time (Last 8 Weeks)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={timeData}>
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                            <Area type="monotone" dataKey="Issues" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: '#6366f1', r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
