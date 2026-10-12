import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon-wrap">📍</div>
                    <span className="brand-text">
                        <span className="brand-space">Local</span>
                        <span className="brand-accent"> Resolve</span>
                    </span>
                </Link>

                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span /><span /><span />
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={`nav-link ${isActive('/')}`} onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link to="/issues" className={`nav-link ${isActive('/issues')}`} onClick={() => setMenuOpen(false)}>Issues</Link>
                    {isAuthenticated() && (
                        <Link to="/report" className={`nav-link ${isActive('/report')}`} onClick={() => setMenuOpen(false)}>Report</Link>
                    )}
                    {isAdmin() && (
                        <Link to="/admin" className={`nav-link ${isActive('/admin')}`} onClick={() => setMenuOpen(false)}>Admin</Link>
                    )}
                </div>

                <div className="navbar-actions">
                    {isAuthenticated() ? (
                        <>
                            <Link to="/profile" className="navbar-user">
                                <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
                                <span className="user-name">{user?.name}</span>
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
