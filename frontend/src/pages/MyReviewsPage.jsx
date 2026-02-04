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
                            color: filled ? '#f59e0b' : '#cbd5e1',
                            textShadow: filled ? '0 1px 6px rgba(245,158,11,0.25)' : 'none',
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
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your reviews...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
            <div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '2rem 1.25rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: '#ff9800' }}>My Reviews</h2>
                    <Link to="/products" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>
                        Browse products
                    </Link>
                </div>

                <div style={{ marginTop: 10, color: '#64748b', fontWeight: 600 }}>
                    View, edit, or delete the reviews you’ve written.
                </div>

                {error && (
                    <div style={{ background: '#ffecec', border: '1px solid #ffb3b3', color: '#b00020', padding: '12px 14px', borderRadius: 10, marginTop: 16 }}>
                        {error}
                    </div>
                )}

                {!error && reviews.length === 0 && (
                    <div style={{ marginTop: 18, color: '#555' }}>
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
                                    border: '1px solid #eef2f7',
                                    borderRadius: 16,
                                    padding: 14,
                                    background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                                    boxShadow: '0 10px 28px rgba(2, 6, 23, 0.06)',
                                }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                        <Link to={`/products/${r.product_id}`} style={{ display: 'inline-block', flex: '0 0 auto' }}>
                                            <img
                                                src={`http://localhost:5000${r.product_image_path || '/images/other_images/dummy_product.jpg'}`}
                                                alt={r.product_name}
                                                style={{ width: 74, height: 74, objectFit: 'cover', borderRadius: 12, border: '1px solid #eef2f7' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                                }}
                                            />
                                        </Link>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Link to={`/products/${r.product_id}`} style={{ textDecoration: 'none', color: '#0f172a' }}>
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
                                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{createdAt}</div>
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
                                                    border: '1.5px solid #cbd5e1',
                                                    padding: 10,
                                                    fontSize: 14,
                                                    outline: 'none',
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                background: '#f8fafc',
                                                border: '1px solid #eef2f7',
                                                borderRadius: 12,
                                                padding: 10,
                                                color: '#334155',
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
                                                    onClick={() => saveEdit(r.id)}
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
                                                        border: '1.5px solid rgba(33,150,243,0.30)',
                                                        background: 'rgba(33,150,243,0.08)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        color: '#1d4ed8',
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
                                                        border: '1.5px solid rgba(220,38,38,0.35)',
                                                        background: 'rgba(220,38,38,0.06)',
                                                        cursor: 'pointer',
                                                        fontWeight: 900,
                                                        color: '#dc2626',
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
    );
};

export default MyReviewsPage;
