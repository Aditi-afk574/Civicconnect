import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

/* ── Animated counter hook ─────────────────────────── */
function useCountUp(target, duration = 1500, start = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!start) return;
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [start, target, duration]);
    return count;
}

/* ── Issues category cards ─────────────────────────── */
const CATEGORIES = [
    { icon: '🕳️', label: 'Potholes', color: '#f97316', desc: 'Damaged roads & pavements' },
    { icon: '💡', label: 'Streetlights', color: '#fbbf24', desc: 'Broken or missing lights' },
    { icon: '🗑️', label: 'Garbage', color: '#34d399', desc: 'Overflow & open dumping' },
    { icon: '💧', label: 'Water Leakage', color: '#60a5fa', desc: 'Pipe bursts & waterlogging' },
    { icon: '🔧', label: 'And More...', color: '#a78bfa', desc: 'Any civic issue in your area' },
];

/* ── Feature row items ─────────────────────────────── */
const FEATURES = [
    { icon: '📍', title: 'Pin on Map', desc: 'Use the interactive map to drop a pin on the exact problem location.' },
    { icon: '📸', title: 'Photo Proof', desc: 'Attach a photo so authorities immediately understand the severity.' },
    { icon: '📡', title: 'Live Tracking', desc: 'Get real-time status — Open → In Progress → Resolved.' },
    { icon: '👍', title: 'Upvote Priority', desc: 'Community upvotes signal urgency and fast-track resolution.' },
    { icon: '📊', title: 'Admin Analytics', desc: 'Authorities track trends, category breakdowns & resolution rates.' },
    { icon: '📸', title: 'Resolution Proof', desc: 'Admins upload a before/after photo when marking resolved.' },
];

/* ── Stat item (with counter) ──────────────────────── */
const StatItem = ({ icon, value, label, color, inView }) => {
    const num = useCountUp(parseInt(value.replace(/,/g, '')), 1800, inView);
    return (
        <div className="hp-stat">
            <div className="hp-stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
            <div className="hp-stat-value" style={{ color }}>
                {inView ? num.toLocaleString() : '0'}+
            </div>
            <div className="hp-stat-label">{label}</div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════ */
const Home = () => {
    const [statsVisible, setStatsVisible] = useState(false);
    const statsRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="home">

            {/* ══ HERO ════════════════════════════════════════════ */}
            <section className="hp-hero">
                {/* ambient glows */}
                <div className="hp-glow hp-glow-1" />
                <div className="hp-glow hp-glow-2" />

                <div className="container hp-hero-inner">
                    <div className="hp-hero-badge">🏘️ Community Issue Reporting Platform</div>

                    <h1 className="hp-hero-title">
                        Report Civic Issues.<br />
                        <span className="hp-grad-text">Track. Resolve. Together.</span>
                    </h1>

                    <p className="hp-hero-sub">
                        LocalResolve bridges citizens and municipal authorities — turning complaints into actions, and problems into proof of resolution.
                    </p>

                    <div className="hp-hero-ctas">
                        <Link to="/report" className="btn btn-primary btn-lg">📋 Report an Issue</Link>
                        <Link to="/issues" className="btn btn-secondary btn-lg">🔍 Browse Issues</Link>
                    </div>

                    {/* floating pill indicators */}
                    <div className="hp-hero-pills">
                        {['🕳️ Pothole Reported', '✅ Streetlight Fixed', '💧 Pipe Repaired', '🗑️ Cleared'].map((p, i) => (
                            <span key={i} className="hp-pill" style={{ animationDelay: `${i * 0.4}s` }}>{p}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ STATS ═══════════════════════════════════════════ */}
            <section className="hp-stats-section" ref={statsRef}>
                <div className="container">
                    <div className="hp-stats-grid">
                        <StatItem icon="🕳️" value="1284" label="Potholes Fixed" color="#f97316" inView={statsVisible} />
                        <StatItem icon="💡" value="843" label="Lights Restored" color="#fbbf24" inView={statsVisible} />
                        <StatItem icon="🗑️" value="2109" label="Garbage Cleared" color="#34d399" inView={statsVisible} />
                        <StatItem icon="💧" value="521" label="Leaks Sealed" color="#60a5fa" inView={statsVisible} />
                    </div>
                </div>
            </section>

            {/* ══ CATEGORIES ══════════════════════════════════════ */}
            <section className="hp-section hp-alt-bg">
                <div className="container">
                    <div className="hp-section-header">
                        <div>
                            <div className="section-label">Categories</div>
                            <h2>Report Any Civic Issue</h2>
                        </div>
                        <p className="text-muted" style={{ maxWidth: 300 }}>Potholes, lights, garbage, water, or anything affecting your community.</p>
                    </div>
                    <div className="hp-cat-grid">
                        {CATEGORIES.map(c => (
                            <Link key={c.label} to={`/issues?category=${c.label.replace(' ', '_').toUpperCase()}`} style={{ textDecoration: 'none' }}>
                                <div className="hp-cat-card" style={{ '--cat-color': c.color }}>
                                    <div className="hp-cat-icon">{c.icon}</div>
                                    <div className="hp-cat-label">{c.label}</div>
                                    <div className="hp-cat-desc">{c.desc}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ HOW IT WORKS ════════════════════════════════════ */}
            <section className="hp-section hp-how-section">
                <div className="container">
                    <div className="hp-section-header">
                        <div>
                            <div className="section-label">Process</div>
                            <h2>How It Works</h2>
                        </div>
                        <p className="text-muted">Three simple steps — from identifying the problem to verified proof.</p>
                    </div>
                    <div className="hp-how-grid">
                        {[
                            { n: '01', icon: '📝', title: 'Submit', desc: 'Describe the problem, attach a photo, and pin it on the map.' },
                            { n: '02', icon: '🔔', title: 'Track', desc: 'Watch status update live — Open → In Progress → Resolved.' },
                            { n: '03', icon: '✅', title: 'Resolved', desc: 'Authorities upload resolution proof; the community confirms.' },
                        ].map(({ n, icon, title, desc }) => (
                            <div key={n} className="hp-how-card">
                                <div className="hp-how-num">{n}</div>
                                <div className="hp-how-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p className="text-muted">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FEATURES ════════════════════════════════════════ */}
            <section className="hp-section">
                <div className="container">
                    <div className="hp-section-header">
                        <div>
                            <div className="section-label">Capabilities</div>
                            <h2>Built for Everyone</h2>
                        </div>
                        <p className="text-muted">Citizens report, admins act, community verifies.</p>
                    </div>
                    <div className="hp-feat-grid">
                        {FEATURES.map(f => (
                            <div key={f.title} className="hp-feat-card">
                                <div className="hp-feat-icon">{f.icon}</div>
                                <div>
                                    <div className="hp-feat-title">{f.title}</div>
                                    <div className="hp-feat-desc">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* ══ CTA BANNER ══════════════════════════════════════ */}
            <section className="hp-cta-banner">
                <div className="hp-cta-glow" />
                <div className="container hp-cta-inner">
                    <h2>See a problem? Report it in 60 seconds.</h2>
                    <p>Join thousands of citizens making their city better — one issue at a time.</p>
                    <Link to="/report" className="btn btn-primary btn-lg">Get Started →</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
