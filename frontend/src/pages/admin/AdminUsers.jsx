import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../api/adminApi';
import { toast } from 'react-toastify';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getAllUsers()
            .then(res => setUsers(res.data || []))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-wrapper">
            <div className="container">
                <div style={{ marginBottom: 24 }}>
                    <h1>👥 Registered Users <span style={{ color: 'var(--text-dim)', fontSize: '1rem', fontWeight: 400 }}>({users.length})</span></h1>
                </div>

                <div className="form-group" style={{ maxWidth: 360, marginBottom: 20 }}>
                    <input className="form-input" placeholder="🔍 Search by name or email..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {loading ? <div className="spinner" /> : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                            <thead>
                                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid var(--border)' }}>
                                    {['#', 'Name', 'Email', 'Role', 'Joined'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{u.id}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div className="flex items-center gap-3">
                                                <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 }}>
                                                    {u.name?.[0]?.toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.email}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-in_progress' : 'badge-resolved'}`}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>No users found.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
