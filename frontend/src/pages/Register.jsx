import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, googleLogin } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import './AuthPages.css';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await registerUser(form);
            login(res.data);
            toast.success(`Welcome to LocalResolve, ${res.data.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await googleLogin(credentialResponse.credential);
            login(res.data);
            toast.success(`Welcome to LocalResolve, ${res.data.name}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Google sign-in failed. Try again.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-glow" />
            <div className="auth-card card">
                <div className="auth-header">
                    <div className="auth-icon">🏘️</div>
                    <h1>Join LocalResolve</h1>
                    <p className="text-muted">Create your citizen account</p>
                </div>

                {/* Google Sign-Up */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error('Google sign-in was cancelled or failed')}
                        theme="filled_black"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                        width="360"
                    />
                </div>

                <div className="auth-divider"><span>or register with email</span></div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" type="text" name="name" id="reg-name"
                            value={form.name} onChange={handleChange} placeholder="John Doe" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input className="form-input" type="email" name="email" id="reg-email"
                            value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" name="password" id="reg-password"
                            value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                    </div>
                    <button type="submit" className="btn btn-primary w-full" id="register-btn" disabled={loading}>
                        {loading ? '⏳ Creating account...' : '✓ Create Account'}
                    </button>
                </form>
                <p className="auth-footer text-center text-muted">
                    Already have an account? <Link to="/login">Sign in →</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
