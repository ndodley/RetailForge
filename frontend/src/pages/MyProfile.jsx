import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { backendImageUrl } from '../utils/images';
import './MyProfile.css';

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
        : backendImageUrl(profile?.avatar_path);

    return (
        <div className="profile-page">
            <div className="profile-shell">
                <div className="profile-card">
                    <div className="profile-header">
                        <div>
                            <h2 className="profile-title">My Profile</h2>
                            <div className="profile-subtitle">View and edit your account info, plus upload an avatar.</div>
                        </div>

                        <div className="profile-actions">
                            <Link to="/products" className="profile-link">
                                Back to products
                            </Link>

                            {!isEditing ? (
                                <button type="button" onClick={startEdit} className="profile-btn">
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <button type="button" onClick={cancelEdit} disabled={saving} className="profile-btn">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={saveProfile} disabled={saving} className="profile-btn profile-btn--primary">
                                        {saving ? 'Saving…' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {error && <div className="profile-error">{error}</div>}

                    <div className="profile-sections">
                        <div className="profile-panel">
                            <div className="profile-panel-title">Avatar</div>

                            <div className="profile-avatar-wrap">
                                <img
                                    src={avatarSrc}
                                    alt="Your avatar"
                                    className="profile-avatar"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = backendImageUrl('');
                                    }}
                                />
                            </div>

                            <div className="profile-file">
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
                                className="profile-btn profile-btn--accent"
                                style={{ marginTop: 12, width: '100%' }}
                            >
                                {uploading ? 'Uploading…' : 'Upload Avatar'}
                            </button>

                            <div className="profile-hint">Tip: Use a square image for best results.</div>
                        </div>

                        <div className="profile-panel">
                            <div className="profile-panel-title">Account Info</div>

                            <div className="profile-fields">
                                <div className="profile-label">First Name</div>
                                {isEditing ? (
                                    <input
                                        value={draft.first_name}
                                        onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className="profile-value">{profile?.first_name || ''}</div>
                                )}

                                <div className="profile-label">Last Name</div>
                                {isEditing ? (
                                    <input
                                        value={draft.last_name}
                                        onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className="profile-value">{profile?.last_name || ''}</div>
                                )}

                                <div className="profile-label">Email</div>
                                {isEditing ? (
                                    <input
                                        value={draft.email}
                                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className="profile-value" style={{ wordBreak: 'break-word' }}>{profile?.email || ''}</div>
                                )}

                                <div className="profile-label">Role</div>
                                <div className="profile-value">{profile?.role || ''}</div>

                                <div className="profile-label">Phone</div>
                                {isEditing ? (
                                    <input
                                        value={draft.phone_number}
                                        onChange={(e) => setDraft((d) => ({ ...d, phone_number: e.target.value }))}
                                        className="profile-input"
                                    />
                                ) : (
                                    <div className="profile-value">{profile?.phone_number || '—'}</div>
                                )}

                                <div className="profile-label" style={{ alignSelf: 'start', paddingTop: 8 }}>Address</div>
                                {isEditing ? (
                                    <textarea
                                        value={draft.address}
                                        onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
                                        className="profile-input profile-textarea"
                                    />
                                ) : (
                                    <div className="profile-value" style={{ whiteSpace: 'pre-wrap' }}>{profile?.address || '—'}</div>
                                )}
                            </div>

                            {isEditing && <div className="profile-note">Note: role cannot be changed here.</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
