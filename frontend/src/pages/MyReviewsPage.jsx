import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../components/common/AdvancedSearchPanel';
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

    const [page, setPage] = useState(1);
    const pageSize = 6;

    const [search, setSearch] = useState('');
    const [ratingFilter, setRatingFilter] = useState('any');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filtersOpen, setFiltersOpen] = useState(false);

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

    useEffect(() => {
        setPage(1);
    }, [reviews.length, search, ratingFilter, sortBy, sortOrder]);

    const filterSections = useMemo(() => {
        return [
            {
                key: 'rating',
                title: 'Rating',
                type: 'radio',
                value: ratingFilter,
                onChange: (v) => setRatingFilter(String(v)),
                options: [
                    { value: 'any', label: 'Any' },
                    { value: '5', label: '5 stars' },
                    { value: '4', label: '4 stars' },
                    { value: '3', label: '3 stars' },
                    { value: '2', label: '2 stars' },
                    { value: '1', label: '1 star' },
                ],
            },
            {
                key: 'sort',
                title: 'Sort',
                type: 'radio',
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
                options: [
                    { value: 'date', label: 'Date' },
                    { value: 'rating', label: 'Rating' },
                    { value: 'product', label: 'Product Name' },
                ],
            },
            {
                key: 'order',
                title: 'Order',
                type: 'radio',
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v)),
                options: [
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' },
                ],
            },
        ];
    }, [ratingFilter, sortBy, sortOrder]);

    const visibleReviews = useMemo(() => {
        let visible = Array.isArray(reviews) ? reviews : [];

        const query = search.trim().toLowerCase();
        if (query) {
            visible = visible.filter((r) => {
                const productName = String(r?.product_name ?? '').toLowerCase();
                const comment = String(r?.comment ?? '').toLowerCase();
                const rating = String(r?.rating ?? '').toLowerCase();
                return productName.includes(query) || comment.includes(query) || rating.includes(query);
            });
        }

        if (ratingFilter !== 'any') {
            const desired = Number(ratingFilter);
            visible = visible.filter((r) => Number(r?.rating || 0) === desired);
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        visible = [...visible].sort((a, b) => {
            if (sortBy === 'rating') return multiplier * (Number(a?.rating || 0) - Number(b?.rating || 0));
            if (sortBy === 'product') return multiplier * String(a?.product_name || '').localeCompare(String(b?.product_name || ''));

            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return multiplier * (aTime - bTime);
        });

        return visible;
    }, [reviews, search, ratingFilter, sortBy, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(visibleReviews.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedReviews = visibleReviews.slice((safePage - 1) * pageSize, safePage * pageSize);

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
        return <div style={{ background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading your reviews...</div>;
    }

    return (
        <div style={{ background: 'var(--app-bg)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 12 }}>
                    <Link
                        to="/products"
                        style={{
                            background: 'var(--surface-3)',
                            color: 'var(--text)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            padding: '10px 12px',
                            fontWeight: 900,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        Browse products
                    </Link>
                </div>

            <div style={{ background: 'var(--surface-2)', borderRadius: 18, boxShadow: 'var(--shadow-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1.75rem 1.5rem 1.25rem', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: 0.3 }}>My Reviews</h2>
                </div>

                <div style={{ marginTop: 10, color: 'var(--muted)', fontWeight: 700 }}>
                    View, edit, or delete the reviews you’ve written.
                </div>

                </div>

                <div style={{ padding: '1.5rem' }}>

                {reviews.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                        <AdvancedSearchPanel
                            title="Advanced Search"
                            query={search}
                            onQueryChange={setSearch}
                            isOpen={filtersOpen}
                            onToggleOpen={() => setFiltersOpen((v) => !v)}
                            onSearch={() => setFiltersOpen(false)}
                            sections={filterSections}
                        />
                    </div>
                )}

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

                {!error && reviews.length > 0 && visibleReviews.length === 0 && (
                    <div style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 800 }}>
                        No reviews match your search.
                    </div>
                )}

                {!error && visibleReviews.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 14,
                        marginBottom: 16,
                    }}>
                        <div style={{ color: 'var(--muted-2)', fontWeight: 800 }}>
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleReviews.length)} of {visibleReviews.length}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: safePage <= 1 ? 0.6 : 1,
                                }}
                            >
                                Prev
                            </button>

                            <div style={{ color: 'var(--muted-2)', fontWeight: 900 }}>
                                Page {safePage} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: safePage >= totalPages ? 0.6 : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {pagedReviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
                        {pagedReviews.map((r) => {
                            const isEditing = editingId === r.id;
                            const createdAt = r.created_at ? new Date(r.created_at).toLocaleString() : '';
                            return (
                                <div key={r.id} style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: 16,
                                    padding: 14,
                                    background: 'var(--surface-3)',
                                    boxShadow: 'var(--shadow-1)',
                                    display: 'flex',
                                    flexDirection: 'column',
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
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                maxHeight: '4.8em',
                                                overflow: 'hidden',
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
        </div>
    );
};

export default MyReviewsPage;
