import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../context/FavoritesContext';

const HomeProductShowcase = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const scrollerRef = useRef(null);
    const dragRef = useRef({
        active: false,
        startX: 0,
        startScrollLeft: 0,
        pointerId: null,
        dragged: false,
    });
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setProducts(list.slice(0, 12));
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load products');
                setLoading(false);
            });
    }, []);

    const items = useMemo(() => products || [], [products]);

    const cardWidth = 320;
    const cardHeight = 400;
    const imageHeight = 236;

    const scrollByAmount = (direction) => {
        const el = scrollerRef.current;
        if (!el) return;
        const amount = Math.max(cardWidth + 14, Math.floor(el.clientWidth * 0.85));
        el.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    if (loading) return <div style={{ textAlign: 'center', color: 'var(--muted-2)', margin: '1.25rem 0 0 0', fontWeight: 700 }}>Loading products...</div>;
    if (error) return <div style={{ textAlign: 'center', color: 'var(--danger)', margin: '1.25rem 0 0 0', fontWeight: 800 }}>{error}</div>;
    if (!items.length) return <div style={{ textAlign: 'center', color: 'var(--muted-2)', margin: '1.25rem 0 0 0', fontWeight: 700 }}>No products to show.</div>;

    return (
        <div style={{ width: '100%', maxWidth: 1320, margin: '0 auto', marginTop: 4 }}>
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    aria-label="Scroll products left"
                    onClick={() => scrollByAmount(-1)}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        boxShadow: 'var(--shadow-1)',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: 22,
                    }}
                    title="Previous"
                >
                    ‹
                </button>

                <div
                    ref={scrollerRef}
                    onPointerDown={(e) => {
                        if (e.pointerType !== 'mouse') return;
                        if (e.button !== 0) return;

                        const el = scrollerRef.current;
                        if (!el) return;

                        dragRef.current.active = true;
                        dragRef.current.dragged = false;
                        dragRef.current.startX = e.clientX;
                        dragRef.current.startScrollLeft = el.scrollLeft;
                        dragRef.current.pointerId = e.pointerId;
                        setIsDragging(false);
                    }}
                    onPointerMove={(e) => {
                        if (e.pointerType !== 'mouse') return;
                        const el = scrollerRef.current;
                        if (!el) return;
                        if (!dragRef.current.active) return;

                        const dx = e.clientX - dragRef.current.startX;

                        // Only enter "drag mode" after a small threshold.
                        if (!dragRef.current.dragged && Math.abs(dx) >= 8) {
                            dragRef.current.dragged = true;
                            setIsDragging(true);

                            // Capture only once we know the user is dragging,
                            // otherwise it can steal the click target from cards.
                            try {
                                el.setPointerCapture?.(dragRef.current.pointerId);
                            } catch {
                                // ignore
                            }
                        }

                        if (dragRef.current.dragged) {
                            el.scrollLeft = dragRef.current.startScrollLeft - dx;
                            e.preventDefault();
                        }
                    }}
                    onPointerUp={(e) => {
                        if (e.pointerType !== 'mouse') return;
                        const el = scrollerRef.current;
                        if (!el) return;
                        dragRef.current.active = false;
                        setIsDragging(false);

                        try {
                            el.releasePointerCapture?.(e.pointerId);
                        } catch {
                            // ignore
                        }

                        dragRef.current.pointerId = null;
                    }}
                    onPointerCancel={() => {
                        dragRef.current.active = false;
                        setIsDragging(false);
                        dragRef.current.pointerId = null;
                    }}
                    onMouseLeave={() => {
                        dragRef.current.active = false;
                        setIsDragging(false);
                        dragRef.current.pointerId = null;
                    }}
                    onClickCapture={(e) => {
                        // If the user was dragging, suppress the click so cards don't navigate.
                        if (dragRef.current.dragged) {
                            e.preventDefault();
                            e.stopPropagation();
                            dragRef.current.dragged = false;
                        }
                    }}
                    style={{
                        display: 'flex',
                        gap: 18,
                        overflowX: 'auto',
                        padding: '14px 64px',
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: isDragging ? 'none' : 'auto',
                    }}
                >
                    {items.map((product) => {
                        const productId = product?.id ?? product?.product_id;
                        return (
                        <div
                            key={productId}
                            role="link"
                            tabIndex={0}
                            aria-label={`View ${product.name}`}
                            onClick={() => {
                                if (productId == null) return;
                                navigate(`/products/${productId}`);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (productId == null) return;
                                    navigate(`/products/${productId}`);
                                }
                            }}
                            style={{
                                flex: '0 0 auto',
                                width: cardWidth,
                                scrollSnapAlign: 'start',
                                cursor: isDragging ? 'grabbing' : 'grab',
                                outline: 'none',
                            }}
                        >
                            <div
                                style={{
                                    border: '1px solid var(--border)',
                                    borderRadius: 18,
                                    background: 'var(--surface-2)',
                                    boxShadow: 'var(--shadow-1)',
                                    height: cardHeight,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    transition: 'filter 0.18s ease, transform 0.18s ease',
                                    position: 'relative',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.filter = 'brightness(0.975)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.filter = 'none';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        if (!user) {
                                            navigate('/login', { state: { from: { pathname: window.location.pathname, search: window.location.search } }, replace: true });
                                            return;
                                        }

                                        if (productId == null) return;
                                        const res = await toggleFavorite(productId);
                                        if (!res.ok && res.error) {
                                            alert(res.error);
                                        }
                                    }}
                                    title={productId != null && isFavorited(productId) ? 'Remove from favorites' : 'Add to favorites'}
                                    aria-label={productId != null && isFavorited(productId) ? 'Remove from favorites' : 'Add to favorites'}
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        width: 42,
                                        height: 42,
                                        borderRadius: 999,
                                        border: productId != null && isFavorited(productId) ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid var(--border)',
                                        background: productId != null && isFavorited(productId) ? 'rgba(255,152,0,0.16)' : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                                        color: productId != null && isFavorited(productId) ? 'var(--accent)' : 'var(--muted-2)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                        fontWeight: 900,
                                        boxShadow: 'var(--shadow-1)',
                                        backdropFilter: 'blur(6px)',
                                    }}
                                >
                                    {productId != null && isFavorited(productId) ? '★' : '☆'}
                                </button>

                                <div style={{
                                    padding: 14,
                                    background: 'var(--surface-3)',
                                    borderBottom: '1px solid var(--border)',
                                    height: imageHeight + 28,
                                    display: 'grid',
                                    placeItems: 'center',
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: imageHeight,
                                        borderRadius: 14,
                                        background: 'var(--surface-2)',
                                        border: '1px solid var(--border)',
                                        padding: 12,
                                        boxSizing: 'border-box',
                                        display: 'grid',
                                        placeItems: 'center',
                                        overflow: 'hidden',
                                    }}>
                                        <img
                                            src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                                            alt={product.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                objectPosition: 'center',
                                                borderRadius: 12,
                                                display: 'block',
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{
                                    padding: 14,
                                    background: 'var(--surface-2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10,
                                    height: cardHeight - (imageHeight + 28),
                                }}>
                                    <div style={{
                                        fontWeight: 900,
                                        color: 'var(--text)',
                                        lineHeight: 1.25,
                                        fontSize: 17,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        minHeight: 44,
                                    }}>
                                        {product.name}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span aria-hidden style={{ display: 'inline-flex', gap: 2, transform: 'translateY(-0.5px)' }}>
                                                {Array.from({ length: 5 }).map((_, idx) => {
                                                    const rating = Number(product.rating || 0);
                                                    const filled = idx < Math.round(rating);
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
                                            <span style={{ color: 'var(--muted-2)', fontWeight: 900, fontSize: 12 }}>
                                                {Number(product.rating || 0).toFixed(1)}
                                            </span>
                                        </div>

                                        <div style={{ color: 'var(--success)', fontWeight: 900, fontSize: 16 }}>
                                            ${Number(product.price || 0).toFixed(2)}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', color: 'var(--muted-2)', fontWeight: 800, fontSize: 12 }}>
                                        Tap to view
                                    </div>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    aria-label="Scroll products right"
                    onClick={() => scrollByAmount(1)}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        boxShadow: 'var(--shadow-1)',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: 22,
                    }}
                    title="Next"
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default HomeProductShowcase;
