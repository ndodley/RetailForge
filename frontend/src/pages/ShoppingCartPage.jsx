import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ShoppingCartPage = () => {
    const { user, loading } = useAuth(); // <-- Get loading from context
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);
    const [loadingCart, setLoadingCart] = useState(true);
    const [error, setError] = useState(null);

    // Enforce login for cart page
    useEffect(() => {
        if (!loading && !user) { // <-- Only redirect if loading is false and user is null
            navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } }, replace: true });
            return;
        }
    }, [user, loading, navigate, location]);

    useEffect(() => {
        const fetchCart = async () => {
            if (!user) {
                setCartItems([]);
                setLoadingCart(false);
                return;
            }
            try {
                // Get or create cart for user
                const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
                const cart = cartRes.data;
                // Get items in cart
                const itemsRes = await axios.get(`http://localhost:5000/api/cart/${cart.id}/items`, { withCredentials: true });
                setCartItems(itemsRes.data);
            } catch (err) {
                setError("Failed to load cart");
            } finally {
                setLoadingCart(false);
            }
        };
        if (user) fetchCart();
    }, [user]);

    // Add: get cart id for update/remove
    const getCartId = async () => {
        const cartRes = await axios.get(`http://localhost:5000/api/cart/user/${user.id}`, { withCredentials: true });
        return cartRes.data.id;
    };

    // Add: update quantity
    const handleUpdateQuantity = async (product_id, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const cart_id = await getCartId();
            await axios.put('http://localhost:5000/api/cart/item', {
                cart_id,
                product_id,
                quantity: newQuantity
            }, { withCredentials: true });
            // Refresh cart
            const itemsRes = await axios.get(`http://localhost:5000/api/cart/${cart_id}/items`, { withCredentials: true });
            setCartItems(itemsRes.data);
        } catch {
            alert('Failed to update quantity.');
        }
    };

    // Add: remove item
    const handleRemove = async (product_id) => {
        try {
            const cart_id = await getCartId();
            await axios.delete('http://localhost:5000/api/cart/item', {
                data: { cart_id, product_id },
                withCredentials: true
            });
            // Refresh cart
            const itemsRes = await axios.get(`http://localhost:5000/api/cart/${cart_id}/items`, { withCredentials: true });
            setCartItems(itemsRes.data);
        } catch {
            alert('Failed to remove item.');
        }
    };

    if (loading || loadingCart) return <div style={{ color: 'var(--text)' }}>Loading cart...</div>; // <-- Show loading until both are done
    if (error) return <div style={{ color: 'var(--text)' }}>{error}</div>;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            padding: 0,
        }}>
            <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem 1rem', background: 'var(--surface-2)', borderRadius: 16, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 700, letterSpacing: 1, margin: 0, color: 'var(--text)' }}>🛒 Shopping Cart</h2>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            background: 'var(--link)',
                            color: 'var(--surface-2)',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 28px',
                            fontWeight: 600,
                            fontSize: 16,
                            boxShadow: 'var(--shadow-1)',
                            cursor: 'pointer',
                            transition: 'filter 0.18s ease',
                            outline: 'none',
                            marginLeft: 16
                        }}
                        onMouseOver={e => { e.currentTarget.style.filter = 'brightness(0.92)'; }}
                        onMouseOut={e => { e.currentTarget.style.filter = 'none'; }}
                    >
                        Continue Shopping
                    </button>
                </div>
                {cartItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--muted-2)', fontSize: 18 }}>Your cart is empty.</p>
                ) : (
                    <>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--surface-3)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                        <thead style={{ background: 'var(--nav-pill-bg)' }}>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, textAlign: 'left', color: 'var(--text)' }}>Product</th>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Image</th>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Price</th>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Quantity</th>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Total</th>
                                <th style={{ padding: '16px 8px', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                    <td style={{ padding: '16px 8px', fontWeight: 600, color: 'var(--text)' }}>{item.name}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <a href={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
                                            <img src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
                                                 alt={item.name}
                                                 style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-3)', display: 'block' }}
                                                 onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                                            />
                                        </a>
                                    </td>
                                    <td style={{ padding: '16px 8px', color: 'var(--link)', fontWeight: 800 }}>${item.price}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--nav-pill-bg-2)', color: 'var(--text)', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>-</button>
                                        <span style={{ minWidth: 32, display: 'inline-block', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--nav-pill-bg-2)', color: 'var(--text)', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>+</button>
                                    </td>
                                    <td style={{ padding: '16px 8px', fontWeight: 800, color: 'var(--text)' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <button onClick={() => handleRemove(item.product_id)} style={{ color: 'var(--surface-2)', background: 'var(--danger)', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-1)' }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', background: 'var(--surface-3)', borderRadius: 8, padding: '18px 36px', boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                            Cart Total: <span style={{ color: 'var(--success)' }}>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    {/* Proceed to Checkout Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <button
                            style={{
                                background: 'var(--link)',
                                color: 'var(--surface-2)',
                                border: 'none',
                                borderRadius: 8,
                                padding: '14px 36px',
                                fontWeight: 600,
                                fontSize: 18,
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-1)',
                                marginLeft: 16
                            }}
                            onClick={() => navigate('/checkout', { state: { cartTotal, cartItems } })}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShoppingCartPage;
