import React from 'react';

// ── Badge definitions ──────────────────────────────────────────
const BADGE_DEFS = [
    {
        id: 'first_reporter',
        emoji: '🌱',
        name: 'First Reporter',
        desc: 'Reported your first civic issue',
        earned: (s) => s.total >= 1,
        color: '#34d399',
    },
    {
        id: 'active_citizen',
        emoji: '⭐',
        name: 'Active Citizen',
        desc: 'Reported 5 or more issues',
        earned: (s) => s.total >= 5,
        color: '#fbbf24',
    },
    {
        id: 'super_reporter',
        emoji: '🔥',
        name: 'Super Reporter',
        desc: 'Reported 15 or more issues',
        earned: (s) => s.total >= 15,
        color: '#f97316',
    },
    {
        id: 'problem_solver',
        emoji: '✅',
        name: 'Problem Solver',
        desc: '3 or more of your issues were resolved',
        earned: (s) => s.resolved >= 3,
        color: '#6366f1',
    },
    {
        id: 'champion',
        emoji: '🏆',
        name: 'Community Champion',
        desc: '10 or more of your issues were resolved',
        earned: (s) => s.resolved >= 10,
        color: '#a78bfa',
    },
    {
        id: 'upvote_magnet',
        emoji: '💥',
        name: 'Upvote Magnet',
        desc: 'One of your issues received 10+ upvotes',
        earned: (s) => s.maxUpvotes >= 10,
        color: '#f43f5e',
    },
];

// ── Compute stats from issues array ───────────────────────────
function computeStats(issues) {
    return {
        total: issues.length,
        resolved: issues.filter(i => i.status === 'RESOLVED').length,
        maxUpvotes: issues.reduce((max, i) => Math.max(max, i.upvotes || 0), 0),
    };
}

// ── BadgeSystem component ──────────────────────────────────────
const BadgeSystem = ({ issues }) => {
    const stats = computeStats(issues);
    const earned = BADGE_DEFS.filter(b => b.earned(stats));
    const locked = BADGE_DEFS.filter(b => !b.earned(stats));

    if (issues.length === 0) return null;

    return (
        <div style={{ marginBottom: 32 }}>
            <h2 style={{ marginBottom: 6 }}>🏅 Badges</h2>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
                {earned.length} of {BADGE_DEFS.length} earned
            </p>

            {earned.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                    {earned.map(b => (
                        <div key={b.id} className="badge-card badge-card--earned" style={{ '--badge-color': b.color }}>
                            <span className="badge-emoji">{b.emoji}</span>
                            <div>
                                <div className="badge-name">{b.name}</div>
                                <div className="badge-desc">{b.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Locked badges */}
            {locked.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {locked.map(b => (
                        <div key={b.id} className="badge-card badge-card--locked" title={b.desc}>
                            <span className="badge-emoji" style={{ filter: 'grayscale(1)', opacity: 0.4 }}>{b.emoji}</span>
                            <div>
                                <div className="badge-name" style={{ opacity: 0.4 }}>{b.name}</div>
                                <div className="badge-desc" style={{ opacity: 0.3 }}>🔒 {b.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
        .badge-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--bg-card);
          min-width: 220px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .badge-card--earned {
          border-color: var(--badge-color);
          background: rgba(var(--badge-color), 0.08);
          box-shadow: 0 0 12px color-mix(in srgb, var(--badge-color) 20%, transparent);
          animation: badge-pop 0.4s ease;
        }
        .badge-card--earned:hover { transform: translateY(-2px); }
        .badge-card--locked { opacity: 0.6; }
        .badge-emoji { font-size: 1.8rem; flex-shrink: 0; }
        .badge-name { font-weight: 700; font-size: 0.88rem; color: var(--text); }
        .badge-desc { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        @keyframes badge-pop {
          0%   { transform: scale(0.85); opacity: 0; }
          80%  { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default BadgeSystem;
