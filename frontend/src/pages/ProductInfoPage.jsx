import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProductInfoPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [inCart, setInCart] = useState(false);
    const [cartCount, setCartCount] = useState(0);

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

    if (loading) return <div>Loading product...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Product not found.</div>;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
        }}>
            <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem 1rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <Link to="/products" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 500 }}>&larr; Back to Products</Link>
                <div
                    style={{
                        marginTop: 24,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 32,
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                        padding: 32,
                        alignItems: 'flex-start',
                    }}
                >
                    <img
                        src={`http://localhost:5000${product.image_path || '/images/other_images/dummy_product.jpg'}`}
                        alt={product.name}
                        style={{
                            width: 320,
                            height: 320,
                            objectFit: 'cover',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                            background: '#f8f8f8',
                            display: 'block',
                        }}
                        onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                    />
                    <div style={{ flex: 1, minWidth: 220 }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>{product.name}</h2>
                        <p style={{ fontSize: '1.3rem', color: '#007bff', fontWeight: 600, margin: '0 0 1rem 0' }}>${product.price}</p>
                        <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: 24 }}>{product.description}</p>
                        {/* Add more product details as needed */}
                        {inCart ? (
                            <button
                                style={{
                                    padding: '0.7rem 2rem',
                                    background: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    transition: 'background 0.2s',
                                }}
                                onClick={handleRemoveFromCart}
                                onMouseOver={e => (e.target.style.background = '#b52a37')}
                                onMouseOut={e => (e.target.style.background = '#dc3545')}
                            >
                                Remove from Cart{cartCount > 1 ? ` (${cartCount})` : ''}
                            </button>
                        ) : (
                            <button
                                style={{
                                    padding: '0.7rem 2rem',
                                    background: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    transition: 'background 0.2s',
                                }}
                                onClick={handleAddToCart}
                                onMouseOver={e => (e.target.style.background = '#218838')}
                                onMouseOut={e => (e.target.style.background = '#28a745')}
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfoPage;
