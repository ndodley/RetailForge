import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Stars = ({ value, onChange, readOnly = false }) => {
    return (
        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            {Array.from({ length: 5 }).map((_, idx) => {
                const starValue = idx + 1;
                const filled = starValue <= value;
                return (
                    <button
                        key={starValue}
                        type="button"
                        disabled={readOnly}
                        onClick={() => onChange && onChange(starValue)}
                        title={`${starValue} star${starValue === 1 ? '' : 's'}`}
                        aria-label={`${starValue} star${starValue === 1 ? '' : 's'}`}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            padding: 0,
                            cursor: readOnly ? 'default' : 'pointer',
                            fontSize: 18,
                            lineHeight: 1,
                            color: filled ? 'var(--accent)' : 'var(--muted-2)',
                            textShadow: filled ? '0 1px 10px rgba(0,0,0,0.18)' : 'none',
                        }}
                    >
                        {filled ? '★' : '☆'}
                    </button>
                );
            })}
        </div>
    );
};

const MyReviewsPage = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    const [reviews, setReviews] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [saving, setSaving] = useState(false);

    const api = useMemo(() => {
        return axios.create({
            baseURL: 'http://localhost:5000/api',
            withCredentials: true,
        });
    }, []);

    const refresh = async () => {
        try {
            setError('');
            setPageLoading(true);
            const res = await api.get('/reviews/my');
            setReviews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to load your reviews.';
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

    const startEdit = (review) => {
        setEditingId(review.id);
        setEditRating(Number(review.rating || 5));
        setEditComment(review.comment || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRating(5);
        setEditComment('');
    };

    const saveEdit = async (reviewId) => {
        try {
            setSaving(true);
            setError('');
            const res = await api.put(`/reviews/my/${reviewId}`, {
                rating: editRating,
                comment: editComment,
            });
            const updated = res.data;
            setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)));
            cancelEdit();
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to update review.';
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    const deleteReview = async (reviewId) => {
        const ok = window.confirm('Delete this review?');
        if (!ok) return;

        try {
            setError('');
            await api.delete(`/reviews/my/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
            if (editingId === reviewId) cancelEdit();
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to delete review.';
            setError(message);
        }
    };

    if (loading) {
        return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading your reviews...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0 }}>
            <div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: 0, background: 'var(--surface-2)', borderRadius: 18, boxShadow: 'var(--shadow-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '2rem 1.25rem 1.25rem', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: 0.3 }}>My Reviews</h2>
                    <Link to="/products" style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 800 }}>
                        Browse products
                    </Link>
                </div>

                <div style={{ marginTop: 10, color: 'var(--muted)', fontWeight: 700 }}>
                    View, edit, or delete the reviews you’ve written.
                </div>

                </div>

                <div style={{ padding: '1.5rem 1.25rem 2rem' }}>

                {error && (
                    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--danger)', padding: '12px 14px', borderRadius: 12, marginTop: 16, fontWeight: 800 }}>
                        {error}
                    </div>
                )}

                {!error && reviews.length === 0 && (
                    <div style={{ marginTop: 18, color: 'var(--muted-2)', fontWeight: 700 }}>
                        You haven’t written any reviews yet.
                    </div>
                )}

                {reviews.length > 0 && (
                    <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
                        {reviews.map((r) => {
                            const isEditing = editingId === r.id;
                            const createdAt = r.created_at ? new Date(r.created_at).toLocaleString() : '';
                            return (
                                <div key={r.id} style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: 16,
                                    padding: 14,
                                    background: 'var(--surface-3)',
                                    boxShadow: 'var(--shadow-1)',
                                }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <Link to={`/products/${r.product_id}`} style={{ display: 'inline-block', flex: '0 0 auto' }}>
                                            <img
                                                src={`http://localhost:5000${r.product_image_path || '/images/other_images/dummy_product.jpg'}`}
                                                alt={r.product_name}
                                                style={{ width: 74, height: 74, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                                }}
                                            />
                                        </Link>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Link to={`/products/${r.product_id}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                                                <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {r.product_name}
                                                </div>
                                            </Link>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                                <Stars
                                                    value={isEditing ? editRating : Number(r.rating || 0)}
                                                    onChange={isEditing ? setEditRating : undefined}
                                                    readOnly={!isEditing}
                                                />
                                                <div style={{ fontSize: 12, color: 'var(--muted-2)', fontWeight: 800 }}>{createdAt}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 10 }}>
                                        {isEditing ? (
                                            <textarea
                                                value={editComment}
                                                onChange={(e) => setEditComment(e.target.value)}
                                                placeholder="Write your review..."
                                                style={{
                                                    width: '100%',
                                                    minHeight: 86,
                                                    resize: 'vertical',
                                                    borderRadius: 12,
                                                    border: '1.5px solid var(--border)',
                                                    background: 'var(--surface-2)',
                                                    color: 'var(--text)',
                                                    padding: 10,
                                                    fontSize: 14,
                                                    outline: 'none',
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                background: 'var(--surface-2)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 12,
                                                padding: 10,
                                                color: 'var(--text)',
                                                lineHeight: 1.55,
                                                whiteSpace: 'pre-wrap',
                                            }}>
                                                {r.comment || ''}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 12, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={cancelEdit}
                                                    disabled={saving}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: 12,
                                                        border: '1.5px solid var(--border)',
                                                        background: 'var(--surface-2)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        color: 'var(--text)',
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => saveEdit(r.id)}
                                                    disabled={saving}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: 12,
                                                        border: 'none',
                                                        background: 'var(--success)',
                                                        color: 'var(--surface-2)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        boxShadow: 'var(--shadow-1)',
                                                    }}
                                                >
                                                    {saving ? 'Saving…' : 'Save'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(r)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: 12,
                                                        border: '1.5px solid var(--border)',
                                                        background: 'var(--nav-pill-bg)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        color: 'var(--link)',
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteReview(r.id)}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderRadius: 12,
                                                        border: '1.5px solid var(--border)',
                                                        background: 'var(--nav-pill-bg)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        color: 'var(--danger)',
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                </div>
            </div>
        </div>
    );
};

export default MyReviewsPage;
