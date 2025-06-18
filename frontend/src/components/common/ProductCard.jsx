import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [inCart, setInCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

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
        } catch {
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

    return (
        <div
            className="product-card"
            style={{
                width: 240,
                height: 370,
                border: '1px solid #eee',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: '1rem',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'box-shadow 0.2s',
                minHeight: 0,
                maxWidth: 240,
                boxSizing: 'border-box',
            }}
        >
            <img
                src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                alt={product.name}
                style={{
                    width: 200,
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 12,
                    display: 'block',
                    background: '#f8f8f8',
                }}
                onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
            />
            <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0', textAlign: 'center' }}>{product.name}</h3>
            <p style={{ color: '#888', margin: '0.25rem 0 0.5rem 0' }}>${product.price}</p>
            <Link
                to={`/products/${product.id}`}
                style={{
                    marginTop: 'auto',
                    padding: '0.5rem 1.2rem',
                    background: '#007bff',
                    color: '#fff',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                    display: 'inline-block',
                }}
                onMouseOver={e => (e.target.style.background = '#0056b3')}
                onMouseOut={e => (e.target.style.background = '#007bff')}
            >
                View Details
            </Link>
            <div style={{ width: '100%', marginTop: 8 }}>
                {inCart ? (
                    <>
                        <button
                            style={{
                                padding: '0.5rem 1.2rem',
                                background: '#dc3545',
                                color: '#fff',
                                borderRadius: 6,
                                border: 'none',
                                fontWeight: 500,
                                cursor: 'pointer',
                                width: '100%',
                                marginBottom: 4,
                            }}
                            onClick={handleRemoveFromCart}
                        >
                            Remove from Cart
                        </button>
                        <div style={{ textAlign: 'center', color: '#555', fontSize: 13 }}>
                            In Cart: <b>{cartCount}</b>
                        </div>
                    </>
                ) : (
                    <button
                        style={{
                            padding: '0.5rem 1.2rem',
                            background: '#28a745',
                            color: '#fff',
                            borderRadius: 6,
                            border: 'none',
                            fontWeight: 500,
                            cursor: 'pointer',
                            width: '100%',
                        }}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
