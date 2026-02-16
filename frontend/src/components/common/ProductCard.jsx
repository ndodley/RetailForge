import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../context/FavoritesContext';

const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const { isFavorited, toggleFavorite } = useFavorites();
    const navigate = useNavigate();
    const [inCart, setInCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const stockCount = Number(product?.stock ?? 0);
    const isOutOfStock = !Number.isFinite(stockCount) || stockCount <= 0;

    const favorite = isFavorited(product.id);

    // Fetch cart status/count for this product
    useEffect(() => {
        const fetchCartStatus = async () => {
            if (!user) {
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
    }, [user, product.id]);

    const handleAddToCart = async () => {
        if (isOutOfStock) {
            alert('This product is currently out of stock.');
            return;
        }
        if (!user) {
            navigate('/login', { state: { from: { pathname: window.location.pathname, search: window.location.search } }, replace: true });
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
            navigate('/login', { state: { from: { pathname: window.location.pathname, search: window.location.search } }, replace: true });
            return;
        }
        try {
            const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
            const cart = cartRes.data;
            await axios.delete('http://localhost:5000/api/cart/item', {
                data: {
                    cart_id: cart.id,
                    product_id: product.id
                },
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
            navigate('/login', { state: { from: { pathname: window.location.pathname, search: window.location.search } }, replace: true });
            return;
        }

        const res = await toggleFavorite(product.id);
        if (!res.ok && res.error) {
            alert(res.error);
        }
    };

    const goToProduct = () => {
        navigate(`/products/${product.id}`);
    };

    const handleCardKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToProduct();
        }
    };

    return (
        <div
            className="product-card"
            style={{
                width: 240,
                height: 360,
                border: '1px solid #eef2f7',
                borderRadius: 16,
                boxShadow: '0 10px 28px rgba(2, 6, 23, 0.08)',
                padding: '0.9rem',
                background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                minHeight: 0,
                maxWidth: 240,
                boxSizing: 'border-box',
                position: 'relative',
                cursor: 'pointer',
            }}
            role="link"
            tabIndex={0}
            aria-label={`View ${product.name}`}
            onClick={goToProduct}
            onKeyDown={handleCardKeyDown}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = '#ffd199';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#eaeaea';
            }}
        >
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite();
                }}
                title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: favorite ? '1.5px solid rgba(255,152,0,0.55)' : '1.5px solid #e5e7eb',
                    background: favorite ? 'rgba(255,152,0,0.14)' : 'rgba(255,255,255,0.92)',
                    color: favorite ? '#ff9800' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 19,
                    fontWeight: 900,
                    boxShadow: '0 8px 18px rgba(2, 6, 23, 0.10)',
                }}
            >
                {favorite ? '★' : '☆'}
            </button>
            <div style={{
                width: '100%',
                background: '#f3f6fb',
                border: '1px solid #eef2f7',
                borderRadius: 14,
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <img
                    src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                    alt={product.name}
                    style={{
                        width: 200,
                        height: 190,
                        objectFit: 'cover',
                        borderRadius: 12,
                        display: 'block',
                        background: '#f8f8f8',
                    }}
                    onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                />
            </div>

            <div style={{ width: '100%', marginTop: 10 }}>
                <div style={{
                    fontSize: '1.02rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: 40,
                }}>
                    {product.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
                    <div style={{ color: '#16a34a', fontWeight: 900, fontSize: 16 }}>
                        ${Number(product.price).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {isOutOfStock && (
                            <div style={{
                                fontSize: 12,
                                fontWeight: 900,
                                color: '#ff9800',
                                background: 'rgba(255,152,0,0.14)',
                                border: '1px solid rgba(255,152,0,0.35)',
                                padding: '4px 8px',
                                borderRadius: 999,
                            }}>
                                Out of stock
                            </div>
                        )}
                        {inCart && (
                            <div style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: '#0f172a',
                                background: 'rgba(34,197,94,0.12)',
                                border: '1px solid rgba(34,197,94,0.25)',
                                padding: '4px 8px',
                                borderRadius: 999,
                            }}>
                                In cart: {cartCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ width: '100%', marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                {inCart ? (
                    <>
                        <button
                            style={{
                                padding: '10px 12px',
                                background: 'transparent',
                                color: '#dc2626',
                                borderRadius: 12,
                                border: '1.5px solid rgba(220,38,38,0.35)',
                                fontWeight: 800,
                                cursor: 'pointer',
                                width: '100%',
                                marginTop: 10,
                                transition: 'background 0.15s ease, border-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(220,38,38,0.06)';
                                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.55)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'rgba(220,38,38,0.35)';
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFromCart();
                            }}
                        >
                            Remove from cart
                        </button>
                    </>
                ) : (
                    <button
                        disabled={isOutOfStock}
                        style={{
                            padding: '10px 12px',
                            background: isOutOfStock
                                ? 'rgba(148,163,184,0.35)'
                                : 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                                color: isOutOfStock ? '#475569' : '#fff',
                            borderRadius: 12,
                                border: 'none',
                            fontWeight: 900,
                            fontSize: 14,
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                width: '100%',
                            marginTop: 10,
                            boxShadow: isOutOfStock ? 'none' : '0 10px 22px rgba(34,197,94,0.20)',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                            }}
                        onMouseEnter={(e) => {
                            if (isOutOfStock) return;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 14px 30px rgba(34,197,94,0.28)';
                        }}
                        onMouseLeave={(e) => {
                            if (isOutOfStock) return;
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 10px 22px rgba(34,197,94,0.20)';
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) return;
                            handleAddToCart();
                        }}
                    >
                        {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
