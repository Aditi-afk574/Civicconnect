import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../api/adminApi';
import { getAllIssues } from '../../api/issueApi';
import {
    AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';

// ── Mini sparkline data generator ──────────────────────────────
function buildSparkline(issues, status) {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
        const dayEnd = dayStart + 86400000;
        const count = issues.filter(is =>
            (!status || is.status === status) &&
            new Date(is.createdAt).getTime() >= dayStart &&
            new Date(is.createdAt).getTime() < dayEnd
        ).length;
        return { v: count };
    });
}

// ── KPI Card with mini sparkline ───────────────────────────────
const KpiCard = ({ icon, label, value, color, sublabel, data, gradient }) => (
    <div className="admin-kpi-card" style={{ '--kpi-color': color, '--kpi-gradient': gradient }}>
        <div className="admin-kpi-top">
            <div className="admin-kpi-icon">{icon}</div>
            <div className="admin-kpi-value">{value}</div>
        </div>
        <div className="admin-kpi-label">{label}</div>
        <div className="admin-kpi-sub">{sublabel}</div>
        <div className="admin-kpi-spark">
            <ResponsiveContainer width="100%" height={44}>
                <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
                    <defs>
                        <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2}
                        fill={`url(#sg-${label})`} dot={false} />
                    <Tooltip
                        content={({ active, payload }) =>
                            active && payload?.length
                                ? <div style={{ background: '#0f172a', border: `1px solid ${color}`, borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', color }}>{payload[0].value}</div>
                                : null
                        }
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// ── Quick action card ──────────────────────────────────────────
const ActionCard = ({ to, icon, title, desc, accent }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div className="admin-action-card" style={{ '--accent': accent }}>
            <div className="admin-action-icon">{icon}</div>
            <div>
                <div className="admin-action-title">{title}</div>
                <div className="admin-action-desc">{desc}</div>
            </div>
            <div className="admin-action-arrow">→</div>
        </div>
    </Link>
);

// ── Status dot map ─────────────────────────────────────────────
const STATUS_META = {
    OPEN: { color: '#60a5fa', dot: '🔵' },
    IN_PROGRESS: { color: '#fbbf24', dot: '🟡' },
    RESOLVED: { color: '#34d399', dot: '🟢' },
    REJECTED: { color: '#f87171', dot: '🔴' },
};

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [allIssues, setAllIssues] = useState([]);
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getAdminStats(),
            getAllIssues({ page: 0, size: 200 }),
        ]).then(([statsRes, issuesRes]) => {
            const issues = issuesRes.data.content || [];
            setStats(statsRes.data);
            setAllIssues(issues);
            setRecentIssues(issues.slice(0, 6));
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="spinner" style={{ margin: '120px auto' }} />;

    const resolutionRate = stats.total
        ? Math.round((stats.resolved / stats.total) * 100)
        : 0;

    const kpis = [
        {
            icon: '📋', label: 'Total Issues', value: stats.total || 0,
            color: '#14b8a6', gradient: 'linear-gradient(135deg,rgba(13,148,136,0.18),rgba(13,148,136,0.04))',
            sublabel: 'All time', data: buildSparkline(allIssues),
        },
        {
            icon: '🔓', label: 'Open Issues', value: stats.open || 0,
            color: '#38bdf8', gradient: 'linear-gradient(135deg,rgba(56,189,248,0.16),rgba(56,189,248,0.04))',
            sublabel: 'Awaiting action', data: buildSparkline(allIssues, 'OPEN'),
        },
        {
            icon: '⚙️', label: 'In Progress', value: stats.inProgress || 0,
            color: '#fbbf24', gradient: 'linear-gradient(135deg,rgba(251,191,36,0.16),rgba(251,191,36,0.04))',
            sublabel: 'Being resolved', data: buildSparkline(allIssues, 'IN_PROGRESS'),
        },
        {
            icon: '✅', label: 'Resolved', value: stats.resolved || 0,
            color: '#34d399', gradient: 'linear-gradient(135deg,rgba(52,211,153,0.16),rgba(52,211,153,0.04))',
            sublabel: `${resolutionRate}% resolution rate`, data: buildSparkline(allIssues, 'RESOLVED'),
        },
    ];

    const actions = [
        { to: '/admin/issues', icon: '📋', title: 'Manage Issues', desc: 'Review, filter & update issue statuses', accent: '#14b8a6' },
        { to: '/admin/analytics', icon: '📊', title: 'Analytics', desc: 'Charts, trends & performance metrics', accent: '#fbbf24' },
        { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'Registered citizens & admins', accent: '#34d399' },
        { to: '/issues', icon: '🌍', title: 'Public Board', desc: 'Preview the citizen-facing view', accent: '#38bdf8' },
    ];

    return (
        <div className="page-wrapper">
            <div className="container">

                {/* ── Header ── */}
                <div className="admin-dashboard-header">
                    <div>
                        <h1 className="admin-dash-title">🛡️ Admin Dashboard</h1>
                        <p className="text-muted">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <Link to="/admin/issues" className="btn btn-primary">+ New Review</Link>
                </div>

                {/* ── KPI Row ── */}
                <div className="admin-kpi-grid" style={{ marginBottom: 32 }}>
                    {kpis.map(k => <KpiCard key={k.label} {...k} />)}
                </div>

                {/* ── Actions + Activity split ── */}
                <div className="admin-split-layout">

                    {/* Quick Actions */}
                    <div>
                        <h2 className="admin-section-title">⚡ Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {actions.map(a => <ActionCard key={a.to} {...a} />)}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                            <h2 className="admin-section-title" style={{ margin: 0 }}>🕐 Recent Activity</h2>
                            <Link to="/admin/issues" className="btn btn-secondary btn-sm">View All →</Link>
                        </div>
                        <div className="admin-activity-feed">
                            {recentIssues.map((issue, i) => {
                                const meta = STATUS_META[issue.status] || { color: '#94a3b8', dot: '⚪' };
                                return (
                                    <Link key={issue.id} to={`/issues/${issue.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="admin-activity-item" style={{ animationDelay: `${i * 60}ms` }}>
                                            <div className="admin-activity-dot" style={{ background: meta.color }} />
                                            <div className="admin-activity-body">
                                                <div className="admin-activity-title">{issue.title}</div>
                                                <div className="admin-activity-meta">
                                                    <span style={{ color: meta.color }}>{issue.status?.replace('_', ' ')}</span>
                                                    <span>·</span>
                                                    <span>{issue.category?.replace('_', ' ')}</span>
                                                    <span>·</span>
                                                    <span>{issue.reporterName}</span>
                                                </div>
                                            </div>
                                            <div className="admin-activity-date">
                                                {new Date(issue.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        /* ── Header ── */
        .admin-dashboard-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 32px;
        }
        .admin-dash-title { font-size: 1.8rem; font-weight: 800; margin: 0 0 4px; }

        /* ── KPI Grid ── */
        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .admin-kpi-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 500px) { .admin-kpi-grid { grid-template-columns: 1fr; } }

        /* ── KPI Card ── */
        .admin-kpi-card {
          background: var(--kpi-gradient);
          border: 1px solid color-mix(in srgb, var(--kpi-color) 30%, transparent);
          border-radius: 16px; padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fadeInUp 0.5s ease both;
        }
        .admin-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px color-mix(in srgb, var(--kpi-color) 25%, transparent);
        }
        .admin-kpi-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .admin-kpi-icon { font-size: 1.5rem; }
        .admin-kpi-value { font-size: 2rem; font-weight: 800; color: var(--kpi-color); line-height: 1; }
        .admin-kpi-label { font-weight: 700; font-size: 0.9rem; margin: 6px 0 2px; color: var(--text); }
        .admin-kpi-sub { font-size: 0.72rem; color: var(--text-dim); margin-bottom: 8px; }
        .admin-kpi-spark { margin: 0 -4px -4px; }

        /* ── Section Title ── */
        .admin-section-title {
          font-size: 1rem; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 16px;
        }

        /* ── Split layout ── */
        .admin-split-layout {
          display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start;
        }
        @media (max-width: 900px) { .admin-split-layout { grid-template-columns: 1fr; } }

        /* ── Action Card ── */
        .admin-action-card {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 18px; border-radius: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: all 0.2s; cursor: pointer;
        }
        .admin-action-card:hover {
          border-color: var(--accent);
          background: color-mix(in srgb, var(--accent) 8%, var(--bg-card));
          transform: translateX(4px);
        }
        .admin-action-icon {
          font-size: 1.4rem; width: 44px; height: 44px; border-radius: 12px;
          background: color-mix(in srgb, var(--accent) 15%, transparent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .admin-action-title { font-weight: 700; font-size: 0.9rem; color: var(--text); }
        .admin-action-desc  { font-size: 0.75rem; color: var(--text-dim); margin-top: 2px; }
        .admin-action-arrow { margin-left: auto; color: var(--text-dim); font-size: 1.1rem; transition: transform 0.2s; }
        .admin-action-card:hover .admin-action-arrow { transform: translateX(4px); color: var(--accent); }

        /* ── Activity Feed ── */
        .admin-activity-feed {
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
        }
        .admin-activity-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
          animation: fadeInUp 0.4s ease both;
        }
        .admin-activity-item:last-child { border-bottom: none; }
        .admin-activity-item:hover { background: rgba(99,102,241,0.06); }
        .admin-activity-dot {
          width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
          box-shadow: 0 0 8px currentColor;
        }
        .admin-activity-body { flex: 1; min-width: 0; }
        .admin-activity-title {
          font-weight: 600; font-size: 0.88rem; color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .admin-activity-meta {
          display: flex; gap: 6px; font-size: 0.73rem; color: var(--text-dim);
          margin-top: 2px; flex-wrap: wrap;
        }
        .admin-activity-date { font-size: 0.72rem; color: var(--text-dim); flex-shrink: 0; }
      `}</style>
        </div>
    );
};

export default AdminDashboard;
