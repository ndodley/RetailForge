import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useFavorites } from '../context/FavoritesContext';

const ProductInfoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inCart, setInCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const isFavorite = product ? isFavorited(product.id) : false;

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load product info');
                setLoading(false);
            });
    }, [id]);

    // Check if product is in cart
    useEffect(() => {
        const fetchCartStatus = async () => {
            if (!user || !product) {
                setInCart(false);
                setCartCount(0);
                return;
            }
            try {
                const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
                const cart = cartRes.data;
                const itemsRes = await axios.get(`http://localhost:5000/api/cart/${cart.id}/items`, { withCredentials: true });
                const item = itemsRes.data.find(i => i.product_id === product.id);
                setInCart(!!item);
                setCartCount(item ? item.quantity : 0);
            } catch {
                setInCart(false);
                setCartCount(0);
            }
        };
        fetchCartStatus();
    }, [user, product]);

    const handleAddToCart = async () => {
        if (!user) {
            // Redirect to login and preserve current location (use pathname and search)
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }
        try {
            const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
            const cart = cartRes.data;
            await axios.post('http://localhost:5000/api/cart/item', {
                cart_id: cart.id,
                product_id: product.id,
                quantity: 1
            }, { withCredentials: true });
            setInCart(true);
            setCartCount(cartCount + 1);
        } catch (err) {
            alert('Failed to add to cart.');
        }
    };

    const handleRemoveFromCart = async () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }
        try {
            const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
            const cart = cartRes.data;
            await axios.delete('http://localhost:5000/api/cart/item', {
                data: { cart_id: cart.id, product_id: product.id },
                withCredentials: true
            });
            setInCart(false);
            setCartCount(0);
        } catch {
            alert('Failed to remove from cart.');
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }

        const res = await toggleFavorite(product.id);
        if (!res.ok && res.error) {
            alert(res.error);
        }
    };

    // --- Reviews state and handlers ---
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [reviewError, setReviewError] = useState(null);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [editReviewId, setEditReviewId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');
    const [expandedComments, setExpandedComments] = useState({});

    useEffect(() => {
        if (!product) return;
        setReviewLoading(true);
        fetch(`http://localhost:5000/api/reviews/product/${product.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch reviews');
                return res.json();
            })
            .then(data => {
                setReviews(data.reviews || []);
                setReviewLoading(false);
            })
            .catch(() => {
                setReviewError('Failed to load reviews');
                setReviewLoading(false);
            });
    }, [product]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }
        setSubmittingReview(true);
        setReviewSuccess('');
        try {
            await axios.post('http://localhost:5000/api/reviews/', {
                product_id: product.id,
                rating: newRating,
                comment: newComment
            }, { withCredentials: true });
            setNewRating(5);
            setNewComment('');
            setReviewSuccess('Review submitted!');
            fetch(`http://localhost:5000/api/reviews/product/${product.id}`)
                .then(res => res.json())
                .then(data => setReviews(data.reviews || []));
        } catch (err) {
            setReviewError('Failed to submit review');
        }
        setSubmittingReview(false);
    };

    const handleDeleteReview = async (id) => {
        if (!user) return;
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${id}`, { withCredentials: true });
            setReviews(reviews.filter(r => r.id !== id));
        } catch {
            alert('Failed to delete review.');
        }
    };

    const handleEditReview = (review) => {
        setEditReviewId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        if (!user) return;
        try {
            await axios.delete(`http://localhost:5000/api/reviews/${editReviewId}`, { withCredentials: true });
            await axios.post('http://localhost:5000/api/reviews/', {
                product_id: product.id,
                rating: editRating,
                comment: editComment
            }, { withCredentials: true });
            setEditReviewId(null);
            fetch(`http://localhost:5000/api/reviews/product/${product.id}`)
                .then(res => res.json())
                .then(data => setReviews(data.reviews || []));
        } catch {
            alert('Failed to update review.');
        }
    };

    const toggleExpandComment = (id) => {
        setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Table column widths state
    const defaultColWidths = [
        120, // User
        90,  // Rating
        370, // Comment (wider)
        120, // Date
        user ? 56 : undefined // Actions (narrower for icons)
    ];
    const [colWidths, setColWidths] = useState(defaultColWidths);
    const handleResize = (index, data) => {
        setColWidths(w => w.map((wVal, i) => (i === index ? data.size.width : wVal)));
    };
    const handleDoubleClick = (index) => {
        setColWidths(w => w.map((wVal, i) => (i === index ? defaultColWidths[i] : wVal)));
    };

    if (loading) return <div>Loading product...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{
            minHeight: '100vh',
               background: 'var(--app-bg)',
            padding: 0,
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            color: '#222',
        }}>
            <div style={{
                maxWidth: 1000,
                margin: '2.5rem auto',
                padding: '2.25rem 1.25rem',
                background: '#fff',
                borderRadius: 22,
                boxShadow: '0 10px 40px rgba(0,0,0,0.10)',
                border: '1px solid #e6eaf0',
            }}>
                <Link
                    to="/products"
                    style={{
                        textDecoration: 'none',
                        color: '#1d4ed8',
                        fontWeight: 800,
                        fontSize: 15,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 10,
                        letterSpacing: 0.2,
                    }}
                >
                    <span aria-hidden="true">←</span>
                    Back to Products
                </Link>
                <div
                    style={{
                        marginTop: 18,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 28,
                        background: 'linear-gradient(120deg, #ffffff 0%, #f7faff 100%)',
                        borderRadius: 18,
                        boxShadow: '0 6px 22px rgba(0,0,0,0.06)',
                        padding: 28,
                        alignItems: 'flex-start',
                        border: '1px solid #e6eaf0',
                    }}
                >
                    <img
                        src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                        alt={product.name}
                        style={{
                            width: 360,
                            height: 360,
                            objectFit: 'cover',
                            borderRadius: 14,
                            boxShadow: '0 10px 28px rgba(0,0,0,0.10)',
                            background: '#f8f8f8',
                            display: 'block',
                            border: '1.5px solid #e6eaf0',
                        }}
                        onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                    />
                    <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                            <h2 style={{
                                fontSize: '2.1rem',
                                margin: 0,
                                fontWeight: 900,
                                letterSpacing: 0.2,
                                lineHeight: 1.15,
                                color: '#0f172a',
                                flex: '1 1 auto',
                            }}>
                                {product.name}
                            </h2>
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 999,
                                    border: isFavorite ? '1.5px solid #ff9800' : '1.5px solid #d9dde6',
                                    background: isFavorite ? 'rgba(255,152,0,0.14)' : 'rgba(255,255,255,0.95)',
                                    color: isFavorite ? '#ff9800' : '#64748b',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    fontWeight: 900,
                                    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    flex: '0 0 auto',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
                                }}
                            >
                                {isFavorite ? '★' : '☆'}
                            </button>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '1.6rem', color: '#16a34a', fontWeight: 900, letterSpacing: 0.2 }}>
                                ${Number(product.price).toFixed(2)}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>
                                {isFavorite ? 'Saved to favorites' : 'Save for later'}
                            </div>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 800 }}>
                                Brand: <span style={{ color: '#0f172a', fontWeight: 900 }}>{product.brand || '—'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                Rating:
                                <span style={{ color: '#0f172a', fontWeight: 900 }}>{Number(product.rating || 0).toFixed(1)}</span>
                                <span aria-hidden style={{ display: 'inline-flex', gap: 2, transform: 'translateY(-0.5px)' }}>
                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const filled = idx < Math.round(Number(product.rating || 0));
                                        return (
                                            <span
                                                key={idx}
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1,
                                                    color: filled ? '#f59e0b' : '#cbd5e1',
                                                    fontWeight: 900,
                                                }}
                                            >
                                                {filled ? '★' : '☆'}
                                            </span>
                                        );
                                    })}
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1.08rem', color: '#334155', marginTop: 14, marginBottom: 22, lineHeight: 1.7 }}>
                            {product.description}
                        </p>
                        {/* Add more product details as needed */}
                        {inCart ? (
                            <button
                                style={{
                                    padding: '0.8rem 2.2rem',
                                    background: 'linear-gradient(90deg, #ff5f6d 0%, #ffc371 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1.08rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                    transition: 'background 0.2s',
                                    marginBottom: 8,
                                    width: '100%',
                                }}
                                onClick={handleRemoveFromCart}
                            >
                                Remove from Cart{cartCount > 1 ? ` (${cartCount})` : ''}
                            </button>
                        ) : (
                            <button
                                style={{
                                    padding: '0.8rem 2.2rem',
                                    background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: '1.08rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                    transition: 'background 0.2s',
                                    marginBottom: 8,
                                    width: '100%',
                                }}
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Table Section */}
            <div style={{
                maxWidth: 1000,
                margin: '2.5rem auto',
                padding: '2.5rem 1.5rem',
                background: '#f9f9ff',
                borderRadius: 20,
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                border: '1px solid #e6eaf0',
            }}>
                <h3 style={{ marginBottom: 20, fontWeight: 700, fontSize: 24, letterSpacing: 0.2 }}>Product Reviews</h3>
                {reviewLoading ? (
                    <div>Loading reviews...</div>
                ) : reviewError ? (
                    <div style={{ color: 'red' }}>{reviewError}</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', tableLayout: 'auto' }}>
                        <thead>
                            <tr style={{ background: '#e6f0ff' }}>
                                {["User", "Rating", "Comment", "Date"]
                                    .concat(user ? ["Actions"] : [])
                                    .map((header, i) => (
                                        <th key={header} style={{ padding: 8, textAlign: 'left', verticalAlign: 'middle', background: '#e6f0ff', borderRight: '1px solid #e0e0e0', width: colWidths[i], minWidth: 60, position: 'relative' }}>
                                            <ResizableBox
                                                width={colWidths[i]}
                                                height={30}
                                                axis="x"
                                                minConstraints={[60, 30]}
                                                maxConstraints={[600, 30]}
                                                handle={
                                                    <span
                                                        style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: '#007bff22' }}
                                                        onDoubleClick={() => handleDoubleClick(i)}
                                                    />
                                                }
                                                onResize={(e, data) => handleResize(i, data)}
                                                resizeHandles={["e"]}
                                                style={{ display: 'inline-block', verticalAlign: 'middle' }}
                                            >
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>{header}</div>
                                            </ResizableBox>
                                        </th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={user && user.id ? 5 : 4} style={{ textAlign: 'center', padding: 16 }}>
                                        No reviews yet. Be the first to review!
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #eee', height: expandedComments[r.id] ? 'auto' : 34, maxHeight: expandedComments[r.id] ? 'none' : 34, transition: 'height 0.3s' }}>
                                        <td style={{ padding: 8, width: 120, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username || 'User'}</td>
                                        <td style={{ padding: 8, width: 90, maxWidth: 90 }}>
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        color: idx < r.rating ? '#e6b800' : '#b0b0b0', // deeper gold for filled, muted gray for empty
                                                        fontSize: '1.25em',
                                                        marginRight: 1,
                                                        textShadow: '0 0 0.5px #333, 0 1px 4px #bfa70055', // subtle dark outline
                                                        WebkitTextStroke: '1px #444', // bolder outline
                                                        transition: 'color 0.2s',
                                                        verticalAlign: 'middle',
                                                    }}
                                                >
                                                    {idx < r.rating ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </td>
                                        {/* Comment cell: name=CommentCell, width=370px, height=34px (collapsed) or auto (expanded), length=1 */}
                                        <td style={{
                                            padding: 8,
                                            width: 370,
                                            maxWidth: 370,
                                            verticalAlign: 'top',
                                            position: 'relative',
                                            background: expandedComments[r.id] ? '#f5f7fa' : '#fff',
                                            borderRadius: expandedComments[r.id] ? '0 0 8px 8px' : 0,
                                            boxShadow: expandedComments[r.id] ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                                            transition: 'background 0.2s',
                                            whiteSpace: 'pre-line', // pre-line preserves new lines and wraps at cell width
                                            wordBreak: 'break-word', // ensures long words wrap
                                            lineHeight: '1.5em',
                                            overflow: 'hidden',
                                        }}>
                                            {editReviewId === r.id ? (
                                                <form onSubmit={handleUpdateReview} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 10,
                                                    background: 'linear-gradient(120deg, #f7fafc 0%, #e6f0ff 100%)',
                                                    borderRadius: 12,
                                                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                                    padding: 18,
                                                    margin: '2px 0',
                                                    border: '1px solid #e0e7ef',
                                                }}>
                                                    <label style={{ fontWeight: 600, marginBottom: 2, color: '#444', fontSize: 15 }}>Edit Comment</label>
                                                    <textarea
                                                        value={editComment}
                                                        onChange={e => setEditComment(e.target.value)}
                                                        style={{
                                                            padding: 10,
                                                            borderRadius: 8,
                                                            border: '1.5px solid #b6c6e3',
                                                            minHeight: 70,
                                                            width: '100%',
                                                            maxWidth: '100%',
                                                            boxSizing: 'border-box',
                                                            resize: 'vertical',
                                                            fontSize: '1.08rem',
                                                            lineHeight: 1.6,
                                                            background: '#fafdff',
                                                            color: '#222',
                                                            marginBottom: 2,
                                                        }}
                                                        rows={4}
                                                        placeholder="Edit your review..."
                                                        required
                                                        wrap="soft"
                                                    />
                                                    <label style={{ fontWeight: 600, marginBottom: 2, color: '#444', fontSize: 15 }}>Edit Rating</label>
                                                    <select value={editRating} onChange={e => setEditRating(Number(e.target.value))} style={{
                                                        marginTop: 0,
                                                        padding: '7px 10px',
                                                        borderRadius: 7,
                                                        border: '1.5px solid #b6c6e3',
                                                        fontSize: '1.08rem',
                                                        background: '#fafdff',
                                                        color: '#222',
                                                        width: 120,
                                                        marginBottom: 2,
                                                    }}>
                                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                                    </select>
                                                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                                        <button type="submit" style={{
                                                            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: 7,
                                                            padding: '7px 22px',
                                                            fontWeight: 700,
                                                            fontSize: '1.08rem',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
                                                            transition: 'background 0.18s',
                                                        }}>Save</button>
                                                        <button type="button" onClick={() => setEditReviewId(null)} style={{
                                                            background: 'linear-gradient(90deg, #e0e7ef 0%, #f7fafc 100%)',
                                                            color: '#444',
                                                            border: '1.5px solid #b6c6e3',
                                                            borderRadius: 7,
                                                            padding: '7px 18px',
                                                            fontWeight: 600,
                                                            fontSize: '1.08rem',
                                                            cursor: 'pointer',
                                                            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                                            transition: 'background 0.18s',
                                                        }}>Cancel</button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <>
                                                    {expandedComments[r.id]
                                                        ? r.comment
                                                        : r.comment.length > 120
                                                            ? r.comment.slice(0, 120) + '...'
                                                            : r.comment}
                                                    {r.comment.length > 120 && (
                                                        <div style={{ textAlign: 'right', marginTop: 4 }}>
                                                            <button onClick={() => toggleExpandComment(r.id)} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                                                                {expandedComments[r.id] ? 'Show less' : 'Show more'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td style={{ padding: 8, width: 120, maxWidth: 120 }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                        {user && user.id === r.user_id && (
                                            <td style={{ padding: 4, width: 56, maxWidth: 56, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEditReview(r)}
                                                    title="Edit Review"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        cursor: 'pointer',
                                                        borderRadius: 6,
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.18s',
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#ffe59a'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                                                >
                                                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                                        <path d="M3 17h14M12.5 6.5l1 1M5 15l8.5-8.5a1.414 1.414 0 012 2L7 17H5v-2z" stroke="#b8860b" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(r.id)}
                                                    title="Delete Review"
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        cursor: 'pointer',
                                                        borderRadius: 6,
                                                        width: 32,
                                                        height: 32,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.18s',
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#ffd6db'}
                                                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                                                >
                                                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                                                        <path d="M6 6l8 8M6 14L14 6" stroke="#d32f2f" strokeWidth="1.7" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {/* Add Review Form */}
                <div style={{ marginTop: 32 }}>
                    <h4>Leave a Review</h4>
                    {user ? (
                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                            <label>
                                Rating:
                                <select value={newRating} onChange={e => setNewRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
                                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </label>
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write your review..."
                                rows={3}
                                style={{ resize: 'vertical', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                                required
                            />
                            <button type="submit" disabled={submittingReview} style={{ background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                            {reviewSuccess && <div style={{ color: 'green' }}>{reviewSuccess}</div>}
                        </form>
                    ) : (
                        <div style={{ color: '#888' }}>You must <Link to="/login">log in</Link> to leave a review.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductInfoPage;
