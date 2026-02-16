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
            const status = err?.response?.status;
            if (status === 409) {
                alert('Not enough stock to add this item.');
                return;
            }
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

    const stockCount = Number(product.stock ?? 0);
    const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0;

    const descriptionParagraphs = String(product.description ?? '')
        // Support both actual newlines and literal "\n" sequences (e.g., from CSV imports)
        .replace(/\\n/g, '\n')
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            padding: 0,
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            color: 'var(--text)',
        }}>
            <div style={{
                maxWidth: 1240,
                margin: '2.5rem auto',
                padding: '2.25rem 1.25rem',
                background: 'var(--surface-2)',
                borderRadius: 22,
                boxShadow: 'var(--shadow-2)',
                border: '1px solid var(--border)',
            }}>
                <Link
                    to="/products"
                    style={{
                        textDecoration: 'none',
                        color: 'var(--text)',
                        fontWeight: 900,
                        fontSize: 14,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 10,
                        letterSpacing: 0.2,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: 'var(--nav-pill-bg)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-1)',
                        transition: 'filter 0.18s ease, transform 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(0.98)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'none';
                        e.currentTarget.style.transform = 'none';
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
                        gap: 34,
                        background: 'var(--surface-3)',
                        borderRadius: 18,
                        boxShadow: 'var(--shadow-1)',
                        padding: 34,
                        alignItems: 'flex-start',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div
                        style={{
                            width: 'min(360px, 100%)',
                            height: 'min(520px, 80vw)',
                            borderRadius: 14,
                            boxShadow: 'var(--shadow-2)',
                            background: 'var(--surface-2)',
                            display: 'grid',
                            placeItems: 'center',
                            border: '1.5px solid var(--border)',
                            overflow: 'hidden',
                            padding: 26,
                            boxSizing: 'border-box',
                        }}
                    >
                        <img
                            src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center center',
                                borderRadius: 0,
                                display: 'block',
                            }}
                            onError={(e) => {
                                e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                            <h2 style={{
                                fontSize: '2.1rem',
                                margin: 0,
                                fontWeight: 900,
                                letterSpacing: 0.2,
                                lineHeight: 1.15,
                                color: 'var(--text)',
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
                                    border: isFavorite ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid var(--border)',
                                    background: isFavorite ? 'rgba(255,152,0,0.16)' : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                                    color: isFavorite ? 'var(--accent)' : 'var(--muted-2)',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    fontWeight: 900,
                                    boxShadow: 'var(--shadow-1)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    flex: '0 0 auto',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-1)';
                                }}
                            >
                                {isFavorite ? '★' : '☆'}
                            </button>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '1.6rem', color: 'var(--success)', fontWeight: 900, letterSpacing: 0.2 }}>
                                ${Number(product.price).toFixed(2)}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 900,
                                    letterSpacing: 0.4,
                                    textTransform: 'uppercase',
                                    padding: '6px 10px',
                                    borderRadius: 999,
                                    border: '1px solid var(--border)',
                                    background: isOutOfStock
                                        ? 'color-mix(in srgb, var(--accent) 18%, var(--surface-2))'
                                        : 'color-mix(in srgb, var(--success) 18%, var(--surface-2))',
                                    color: isOutOfStock ? 'var(--accent)' : 'var(--success)',
                                }}
                            >
                                {isOutOfStock ? 'Out of stock' : 'In stock'}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 700 }}>
                                {isFavorite ? 'Saved to favorites' : 'Save for later'}
                            </div>
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800 }}>
                                Brand: <span style={{ color: 'var(--text)', fontWeight: 900 }}>{product.brand || '—'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--muted-2)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                                Rating:
                                <span style={{ color: 'var(--text)', fontWeight: 900 }}>{Number(product.rating || 0).toFixed(1)}</span>
                                <span aria-hidden style={{ display: 'inline-flex', gap: 2, transform: 'translateY(-0.5px)' }}>
                                    {Array.from({ length: 5 }).map((_, idx) => {
                                        const filled = idx < Math.round(Number(product.rating || 0));
                                        return (
                                            <span
                                                key={idx}
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: 1,
                                                    color: filled ? 'var(--accent)' : 'var(--muted-2)',
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

                        <div style={{ marginTop: 14, marginBottom: 22 }}>
                            {descriptionParagraphs.map((paragraph, index) => (
                                <p
                                    key={index}
                                    style={{
                                        fontSize: '1.08rem',
                                        color: 'var(--muted)',
                                        margin: 0,
                                        marginTop: index === 0 ? 0 : 16,
                                        lineHeight: 1.7,
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        {/* Add more product details as needed */}
                        {inCart ? (
                            <button
                                style={{
                                    padding: '0.8rem 2.2rem',
                                    background: 'color-mix(in srgb, var(--danger) 85%, transparent)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    fontSize: '1.08rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-1)',
                                    transition: 'filter 0.18s ease, transform 0.18s ease',
                                    marginBottom: 8,
                                    width: '100%',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.filter = 'brightness(0.98)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }}
                                onClick={handleRemoveFromCart}
                            >
                                Remove from Cart{cartCount > 1 ? ` (${cartCount})` : ''}
                            </button>
                        ) : (
                            <button
                                disabled={isOutOfStock}
                                style={{
                                    padding: '0.8rem 2.2rem',
                                    background: isOutOfStock
                                        ? 'color-mix(in srgb, var(--muted-2) 28%, var(--surface-2))'
                                        : 'var(--link)',
                                    color: isOutOfStock ? 'var(--muted)' : 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 10,
                                    fontSize: '1.08rem',
                                    fontWeight: 600,
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    boxShadow: 'var(--shadow-1)',
                                    transition: 'filter 0.18s ease, transform 0.18s ease',
                                    marginBottom: 8,
                                    width: '100%',
                                }}
                                onMouseOver={(e) => {
                                    if (isOutOfStock) return;
                                    e.currentTarget.style.filter = 'brightness(0.98)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    if (isOutOfStock) return;
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }}
                                onClick={isOutOfStock ? undefined : handleAddToCart}
                                title={isOutOfStock ? 'This product is currently out of stock.' : undefined}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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
                background: 'var(--surface-2)',
                borderRadius: 20,
                boxShadow: 'var(--shadow-1)',
                border: '1px solid var(--border)',
            }}>
                <h3 style={{ marginBottom: 18, fontWeight: 900, fontSize: 24, letterSpacing: 0.2, color: 'var(--text)' }}>Product Reviews</h3>
                {reviewLoading ? (
                    <div style={{ color: 'var(--muted-2)', fontWeight: 800 }}>Loading reviews...</div>
                ) : reviewError ? (
                    <div style={{ color: 'var(--danger)', fontWeight: 900 }}>{reviewError}</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--surface-3)', borderRadius: 14, overflow: 'hidden', tableLayout: 'auto', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)' }}>
                        <thead>
                            <tr style={{ background: 'var(--nav-bg)' }}>
                                {["User", "Rating", "Comment", "Date"]
                                    .concat(user ? ["Actions"] : [])
                                    .map((header, i) => (
                                        <th key={header} style={{ padding: 10, textAlign: 'left', verticalAlign: 'middle', background: 'var(--nav-bg)', borderRight: '1px solid var(--border)', width: colWidths[i], minWidth: 60, position: 'relative', color: 'var(--text)', fontWeight: 900 }}>
                                            <ResizableBox
                                                width={colWidths[i]}
                                                height={30}
                                                axis="x"
                                                minConstraints={[60, 30]}
                                                maxConstraints={[600, 30]}
                                                handle={
                                                    <span
                                                        style={{ position: 'absolute', right: 0, top: 0, width: 8, height: '100%', cursor: 'col-resize', zIndex: 2, background: 'color-mix(in srgb, var(--link) 18%, transparent)' }}
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
                                    <td colSpan={user && user.id ? 5 : 4} style={{ textAlign: 'center', padding: 18, color: 'var(--muted-2)', fontWeight: 800 }}>
                                        No reviews yet. Be the first to review!
                                    </td>
                                </tr>
                            ) : (
                                reviews.map(r => (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            height: expandedComments[r.id] ? 'auto' : 40,
                                            maxHeight: expandedComments[r.id] ? 'none' : 40,
                                            transition: 'height 0.3s, background 0.18s ease',
                                            background: 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'color-mix(in srgb, var(--surface-2) 85%, transparent)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <td style={{ padding: '12px 10px', width: 160, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text)', fontWeight: 800 }}>
                                            {r.username || 'User'}
                                        </td>
                                        <td style={{ padding: '12px 10px', width: 120, maxWidth: 120 }}>
                                            {Array.from({ length: 5 }).map((_, idx) => (
                                                <span
                                                    key={idx}
                                                    style={{
                                                        color: idx < r.rating ? 'var(--accent)' : 'var(--muted-2)',
                                                        fontSize: '1.25em',
                                                        marginRight: 1,
                                                        textShadow: 'none',
                                                        WebkitTextStroke: '0',
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
                                            padding: '12px 10px',
                                            width: 370,
                                            maxWidth: 370,
                                            verticalAlign: 'top',
                                            position: 'relative',
                                            background: expandedComments[r.id] ? 'var(--surface-2)' : 'var(--surface-3)',
                                            borderRadius: expandedComments[r.id] ? '0 0 8px 8px' : 0,
                                            boxShadow: expandedComments[r.id] ? 'var(--shadow-1)' : 'none',
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
                                                    background: 'var(--surface-2)',
                                                    borderRadius: 12,
                                                    boxShadow: 'var(--shadow-1)',
                                                    padding: 18,
                                                    margin: '2px 0',
                                                    border: '1px solid var(--border)',
                                                }}>
                                                    <label style={{ fontWeight: 800, marginBottom: 2, color: 'var(--text)', fontSize: 15 }}>Edit Comment</label>
                                                    <textarea
                                                        value={editComment}
                                                        onChange={e => setEditComment(e.target.value)}
                                                        style={{
                                                            padding: 10,
                                                            borderRadius: 8,
                                                            border: '1.5px solid var(--border)',
                                                            minHeight: 70,
                                                            width: '100%',
                                                            maxWidth: '100%',
                                                            boxSizing: 'border-box',
                                                            resize: 'vertical',
                                                            fontSize: '1.08rem',
                                                            lineHeight: 1.6,
                                                            background: 'var(--surface-3)',
                                                            color: 'var(--text)',
                                                            marginBottom: 2,
                                                        }}
                                                        rows={4}
                                                        placeholder="Edit your review..."
                                                        required
                                                        wrap="soft"
                                                    />
                                                    <label style={{ fontWeight: 800, marginBottom: 2, color: 'var(--text)', fontSize: 15 }}>Edit Rating</label>
                                                    <select value={editRating} onChange={e => setEditRating(Number(e.target.value))} style={{
                                                        marginTop: 0,
                                                        padding: '7px 10px',
                                                        borderRadius: 7,
                                                        border: '1.5px solid var(--border)',
                                                        fontSize: '1.08rem',
                                                        background: 'var(--surface-3)',
                                                        color: 'var(--text)',
                                                        width: 120,
                                                        marginBottom: 2,
                                                    }}>
                                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                                    </select>
                                                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                                                        <button type="submit" style={{
                                                            background: 'var(--link)',
                                                            color: 'var(--surface-2)',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: 7,
                                                            padding: '7px 22px',
                                                            fontWeight: 700,
                                                            fontSize: '1.08rem',
                                                            cursor: 'pointer',
                                                            boxShadow: 'var(--shadow-1)',
                                                            transition: 'filter 0.18s ease',
                                                        }}>Save</button>
                                                        <button type="button" onClick={() => setEditReviewId(null)} style={{
                                                            background: 'var(--nav-pill-bg)',
                                                            color: 'var(--text)',
                                                            border: '1.5px solid var(--border)',
                                                            borderRadius: 7,
                                                            padding: '7px 18px',
                                                            fontWeight: 600,
                                                            fontSize: '1.08rem',
                                                            cursor: 'pointer',
                                                            boxShadow: 'var(--shadow-1)',
                                                            transition: 'filter 0.18s ease',
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
                                                            <button onClick={() => toggleExpandComment(r.id)} style={{ background: 'none', border: 'none', color: 'var(--link)', cursor: 'pointer', fontSize: 13, fontWeight: 800, padding: 0 }}>
                                                                {expandedComments[r.id] ? 'Show less' : 'Show more'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 10px', width: 120, maxWidth: 120, color: 'var(--text)', fontWeight: 800 }}>
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
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
                <div style={{ marginTop: 26 }}>
                    <h4 style={{ margin: 0, fontWeight: 900, color: 'var(--text)', letterSpacing: 0.2 }}>Leave a Review</h4>
                    {user ? (
                        <form
                            onSubmit={handleSubmitReview}
                            style={{
                                marginTop: 12,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                width: '100%',
                                maxWidth: 720,
                                background: 'var(--surface-3)',
                                border: '1px solid var(--border)',
                                borderRadius: 14,
                                padding: 16,
                                boxShadow: 'var(--shadow-1)',
                            }}
                        >
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontWeight: 800, color: 'var(--text)' }}>
                                <span>Rating</span>
                                <select
                                    value={newRating}
                                    onChange={e => setNewRating(Number(e.target.value))}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface-2)',
                                        color: 'var(--text)',
                                        fontWeight: 800,
                                        minWidth: 140,
                                    }}
                                >
                                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                </select>
                            </label>
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write your review..."
                                rows={5}
                                style={{ resize: 'vertical', padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', fontSize: 15, lineHeight: 1.6 }}
                                required
                            />
                            <button
                                type="submit"
                                disabled={submittingReview}
                                style={{
                                    background: 'var(--link)',
                                    color: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '12px 18px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-1)',
                                    width: '100%',
                                    transition: 'filter 0.18s ease, transform 0.18s ease',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.filter = 'brightness(0.98)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                            {reviewSuccess && <div style={{ color: 'var(--success)', fontWeight: 800 }}>{reviewSuccess}</div>}
                        </form>
                    ) : (
                        <div style={{ color: 'var(--muted-2)', fontWeight: 700 }}>You must <Link to="/login" style={{ color: 'var(--link)', fontWeight: 900, textDecoration: 'none' }}>log in</Link> to leave a review.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductInfoPage;
