import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, googleLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import './AuthPages.css';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(form);
            login(res.data);
            toast.success(`Welcome back, ${res.data.name}!`);
            navigate(res.data.role === 'ADMIN' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            login(res.data);
            toast.success(`Welcome, ${res.data.name}!`);
            navigate(res.data.role === 'ADMIN' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Google sign-in failed. Try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <div className="auth-card card">
                <div className="auth-header">
                    <div className="auth-icon">🔐</div>
                    <h1>Welcome Back</h1>
                    <p className="text-muted">Sign in to your LocalResolve account</p>
                </div>

                {/* Google Sign-In (official @react-oauth/google widget) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google sign-in was cancelled or failed')}
                        theme="filled_black"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                        width="360"
                    />
                </div>

                <div className="auth-divider"><span>or continue with email</span></div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" name="email" id="login-email"
                            value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" name="password" id="login-password"
                            value={form.password} onChange={handleChange} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" id="login-btn" disabled={loading}>
                        {loading ? '⏳ Signing in...' : '→ Sign In'}
                    </button>
                </form>
                <p className="auth-footer text-center text-muted">
                    Don't have an account? <Link to="/register">Create one →</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
