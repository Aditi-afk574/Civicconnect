import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '40px 0 24px',
        marginTop: 'auto',
    }}>
        <div className="container">
            <div className="grid-3" style={{ marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: '1.3rem' }}>📍</span>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                            Local<span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Resolve</span>
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                        Bridging citizens and municipal authorities for faster, transparent civic issue resolution.
                    </p>
                </div>
                <div>
                    <h4 style={{ marginBottom: 12, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Quick Links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[['/', 'Home'], ['/issues', 'Browse Issues'], ['/report', 'Report Issue'], ['/register', 'Join Now']].map(([to, label]) => (
                            <Link key={to} to={to} style={{ color: 'var(--text-dim)', fontSize: '0.85rem', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.target.style.color = 'var(--primary-light)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
                            >{label}</Link>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 style={{ marginBottom: 12, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>Issue Categories</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['🕳️ Potholes', '💡 Streetlights', '🗑️ Garbage', '💧 Water Leakage', '🔧 Other'].map(cat => (
                            <span key={cat} style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 99, fontSize: '0.75rem' }}>{cat}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                © 2025 LocalResolve. Built to make communities better. 🏘️
            </div>
        </div>
    </footer>
);

export default Footer;
