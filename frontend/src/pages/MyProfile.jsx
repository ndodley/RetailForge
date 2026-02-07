import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const MyProfile = () => {
    const { user, loading, refreshUser } = useAuth();
    const location = useLocation();

    const api = useMemo(() => {
        return axios.create({
            baseURL: 'http://localhost:5000/api',
            withCredentials: true,
        });
    }, []);

    const [profile, setProfile] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const refresh = async () => {
        try {
            setError('');
            setPageLoading(true);
            const res = await api.get('/users/me');
            setProfile(res.data);

            setDraft({
                first_name: res.data?.first_name || '',
                last_name: res.data?.last_name || '',
                email: res.data?.email || '',
                phone_number: res.data?.phone_number || '',
                address: res.data?.address || '',
            });
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to load your profile.';
            setError(message);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            refresh();
        }
        if (!loading && !user) {
            setPageLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user]);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewUrl('');
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please choose an image first.');
            return;
        }

        try {
            setUploading(true);
            setError('');

            const form = new FormData();
            form.append('avatar', selectedFile);

            const res = await api.put('/users/me/avatar', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setProfile(res.data);
            await refreshUser?.();
            setSelectedFile(null);
            setPreviewUrl('');
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to upload avatar.';
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    const startEdit = () => {
        setError('');
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setError('');
        setIsEditing(false);
        setDraft({
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: profile?.email || '',
            phone_number: profile?.phone_number || '',
            address: profile?.address || '',
        });
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            setError('');

            const payload = {
                first_name: draft.first_name,
                last_name: draft.last_name,
                email: draft.email,
                phone_number: draft.phone_number,
                address: draft.address,
            };

            const res = await api.put('/users/me', payload);
            setProfile(res.data);
            setIsEditing(false);
            await refreshUser?.();
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to update your profile.';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your profile...</div>;
    }

    const avatarSrc = previewUrl
        ? previewUrl
        : `http://localhost:5000${profile?.avatar_path || '/images/other_images/dummy_product.jpg'}`;

    const inputStyle = {
        width: '100%',
        borderRadius: 12,
        border: '1.5px solid #cbd5e1',
        padding: '10px 12px',
        fontSize: 14,
        outline: 'none',
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)' }}>
            <div
                style={{
                    maxWidth: 1100,
                    margin: '2.5rem auto',
                    padding: '2rem 1.25rem',
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <h2 style={{ fontWeight: 900, margin: 0, color: '#ff9800' }}>My Profile</h2>
                        <div style={{ marginTop: 8, color: '#64748b', fontWeight: 600 }}>
                            View and edit your account info, plus upload an avatar.
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Link to="/products" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>
                            Back to products
                        </Link>

                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={startEdit}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: 12,
                                    border: '1.5px solid rgba(33,150,243,0.30)',
                                    background: 'rgba(33,150,243,0.08)',
                                    cursor: 'pointer',
                                    fontWeight: 900,
                                    color: '#1d4ed8',
                                }}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 12,
                                        border: '1.5px solid #cbd5e1',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 900,
                                        color: '#0f172a',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveProfile}
                                    disabled={saving}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 12,
                                        border: 'none',
                                        background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 900,
                                        boxShadow: '0 10px 22px rgba(34,197,94,0.20)',
                                    }}
                                >
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#ffecec', border: '1px solid #ffb3b3', color: '#b00020', padding: '12px 14px', borderRadius: 10, marginTop: 16 }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
                    <div style={{
                        border: '1px solid #eef2f7',
                        borderRadius: 16,
                        padding: 14,
                        background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                        boxShadow: '0 10px 28px rgba(2, 6, 23, 0.06)',
                    }}>
                        <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Avatar</div>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <img
                                src={avatarSrc}
                                alt="Your avatar"
                                style={{ width: 180, height: 180, borderRadius: 999, objectFit: 'cover', border: '1px solid #eef2f7' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 12 }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading || !selectedFile}
                            style={{
                                marginTop: 12,
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 12,
                                border: 'none',
                                background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)',
                                color: '#fff',
                                cursor: uploading || !selectedFile ? 'not-allowed' : 'pointer',
                                fontWeight: 900,
                                boxShadow: '0 10px 22px rgba(255,152,0,0.22)',
                            }}
                        >
                            {uploading ? 'Uploading…' : 'Upload Avatar'}
                        </button>

                        <div style={{ marginTop: 10, color: '#64748b', fontWeight: 600, fontSize: 12 }}>
                            Tip: Use a square image for best results.
                        </div>
                    </div>

                    <div style={{
                        border: '1px solid #eef2f7',
                        borderRadius: 16,
                        padding: 14,
                        background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                        boxShadow: '0 10px 28px rgba(2, 6, 23, 0.06)',
                    }}>
                        <div style={{ fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>Account Info</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 10, columnGap: 12, alignItems: 'center' }}>
                            <div style={{ color: '#64748b', fontWeight: 800 }}>First Name</div>
                            {isEditing ? (
                                <input
                                    value={draft.first_name}
                                    onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{profile?.first_name || ''}</div>
                            )}

                            <div style={{ color: '#64748b', fontWeight: 800 }}>Last Name</div>
                            {isEditing ? (
                                <input
                                    value={draft.last_name}
                                    onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{profile?.last_name || ''}</div>
                            )}

                            <div style={{ color: '#64748b', fontWeight: 800 }}>Email</div>
                            {isEditing ? (
                                <input
                                    value={draft.email}
                                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontWeight: 800, color: '#0f172a', wordBreak: 'break-word' }}>{profile?.email || ''}</div>
                            )}

                            <div style={{ color: '#64748b', fontWeight: 800 }}>Role</div>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{profile?.role || ''}</div>

                            <div style={{ color: '#64748b', fontWeight: 800 }}>Phone</div>
                            {isEditing ? (
                                <input
                                    value={draft.phone_number}
                                    onChange={(e) => setDraft((d) => ({ ...d, phone_number: e.target.value }))}
                                    style={inputStyle}
                                />
                            ) : (
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{profile?.phone_number || '—'}</div>
                            )}

                            <div style={{ color: '#64748b', fontWeight: 800, alignSelf: 'start', paddingTop: 8 }}>Address</div>
                            {isEditing ? (
                                <textarea
                                    value={draft.address}
                                    onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                                />
                            ) : (
                                <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'pre-wrap' }}>{profile?.address || '—'}</div>
                            )}
                        </div>

                        {isEditing && (
                            <div style={{ marginTop: 14, color: '#64748b', fontWeight: 700, fontSize: 12 }}>
                                Note: role cannot be changed here.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
