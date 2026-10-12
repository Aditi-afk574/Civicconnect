import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../api/issueApi';
import { toast } from 'react-toastify';
import MapLocationPicker from '../components/MapLocationPicker';
import '../components/MapLocationPicker.css';

const CATEGORIES = ['POTHOLE', 'STREETLIGHT', 'GARBAGE', 'WATER_LEAKAGE', 'OTHER'];
const CATEGORY_EMOJIS = { POTHOLE: '🕳️', STREETLIGHT: '💡', GARBAGE: '🗑️', WATER_LEAKAGE: '💧', OTHER: '🔧' };

const ReportIssue = () => {
    const navigate = useNavigate();
    const fileRef = useRef();
    const [form, setForm] = useState({ title: '', description: '', category: 'POTHOLE' });
    const [location, setLocation] = useState({ address: '', lat: null, lng: null });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleLocationChange = ({ lat, lng, address }) => {
        setLocation({ lat, lng, address });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location.address) {
            toast.error('Please select a location on the map');
            return;
        }
        setLoading(true);
        try {
            const issueData = {
                ...form,
                location: location.address,
                latitude: location.lat,
                longitude: location.lng,
            };
            const formData = new FormData();
            formData.append('issue', JSON.stringify(issueData));
            if (image) formData.append('image', image);
            const res = await createIssue(formData);
            toast.success('Issue reported successfully!');
            navigate(`/issues/${res.data.id}`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit issue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container" style={{ maxWidth: 760 }}>
                <div style={{ marginBottom: 32 }}>
                    <h1>📋 Report an Issue</h1>
                    <p className="text-muted">Help your community by reporting a civic problem</p>
                </div>

                <div className="card" style={{ padding: 36 }}>
                    <form onSubmit={handleSubmit}>
                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">Issue Category</label>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat} type="button"
                                        onClick={() => setForm(f => ({ ...f, category: cat }))}
                                        style={{
                                            padding: '8px 16px', borderRadius: 99, border: '1.5px solid',
                                            borderColor: form.category === cat ? 'var(--primary-light)' : 'var(--border)',
                                            background: form.category === cat ? 'rgba(99,102,241,0.15)' : 'transparent',
                                            color: form.category === cat ? 'var(--primary-light)' : 'var(--text-muted)',
                                            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                                        }}>
                                        {CATEGORY_EMOJIS[cat]} {cat.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Issue Title</label>
                            <input className="form-input" name="title" id="issue-title"
                                value={form.title} onChange={handleChange}
                                placeholder="e.g., Large pothole on Main Street" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" name="description" id="issue-description"
                                value={form.description} onChange={handleChange}
                                placeholder="Describe the issue in detail — size, severity, how long it's been there..."
                                style={{ minHeight: 110 }} required />
                        </div>

                        {/* Uber/Rapido style map location picker */}
                        <div className="form-group">
                            <label className="form-label">
                                📍 Pick Exact Location
                                <span className="text-muted text-sm" style={{ marginLeft: 8, fontWeight: 400 }}>
                                    — Drag the map or search to pin the issue location
                                </span>
                            </label>
                            <MapLocationPicker onLocationChange={handleLocationChange} />
                            {location.address && (
                                <div style={{ marginTop: 10, padding: '8px 14px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, fontSize: '0.82rem', color: '#34d399' }}>
                                    ✅ Location selected: <strong>{location.lat?.toFixed(5)}, {location.lng?.toFixed(5)}</strong>
                                </div>
                            )}
                        </div>

                        {/* Image Upload */}
                        <div className="form-group">
                            <label className="form-label">Photo (Optional)</label>
                            <div
                                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                                onClick={() => fileRef.current.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" style={{ maxHeight: 180, borderRadius: 8, objectFit: 'contain' }} />
                                ) : (
                                    <>
                                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drop an image here or click to browse</p>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => handleFile(e.target.files[0])} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" id="submit-issue" disabled={loading}>
                            {loading ? '⏳ Submitting...' : '📤 Submit Issue Report'}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
        .upload-zone {
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 140px;
        }
        .upload-zone:hover, .upload-zone.drag-over {
          border-color: var(--primary-light);
          background: rgba(99,102,241,0.05);
        }
      `}</style>
        </div>
    );
};

export default ReportIssue;
