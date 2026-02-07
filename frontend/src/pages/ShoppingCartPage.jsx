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

    if (loading || loadingCart) return <div>Loading cart...</div>; // <-- Show loading until both are done
    if (error) return <div>{error}</div>;

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--app-bg)',
            padding: 0,
        }}>
            <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem 1rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 700, letterSpacing: 1, margin: 0 }}>🛒 Shopping Cart</h2>
                    <button
                        onClick={() => navigate('/products')}
                        style={{
                            background: 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 28px',
                            fontWeight: 600,
                            fontSize: 16,
                            boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
                            cursor: 'pointer',
                            transition: 'background 0.2s, box-shadow 0.2s',
                            outline: 'none',
                            marginLeft: 16
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#0056b3'}
                        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)'}
                    >
                        Continue Shopping
                    </button>
                </div>
                {cartItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>Your cart is empty.</p>
                ) : (
                    <>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fafbfc', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <thead style={{ background: '#f5f7fa' }}>
                            <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16, textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16 }}>Image</th>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16 }}>Price</th>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16 }}>Quantity</th>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16 }}>Total</th>
                                <th style={{ padding: '16px 8px', fontWeight: 600, fontSize: 16 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 8px', fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <a href={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
                                            <img src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
                                                 alt={item.name}
                                                 style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee', background: '#f8f8f8', display: 'block' }}
                                                 onError={e => { e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                                            />
                                        </a>
                                    </td>
                                    <td style={{ padding: '16px 8px', color: '#007bff', fontWeight: 600 }}>${item.price}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} style={{ marginRight: 8, padding: '4px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f7fa', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>-</button>
                                        <span style={{ minWidth: 32, display: 'inline-block', textAlign: 'center', fontWeight: 500 }}>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} style={{ marginLeft: 8, padding: '4px 10px', borderRadius: 6, border: '1px solid #ddd', background: '#f5f7fa', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>+</button>
                                    </td>
                                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</td>
                                    <td style={{ padding: '16px 8px' }}>
                                        <button onClick={() => handleRemove(item.product_id)} style={{ color: '#fff', background: '#dc3545', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 4px rgba(220,53,69,0.08)' }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#222', background: '#f5f7fa', borderRadius: 8, padding: '18px 36px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            Cart Total: <span style={{ color: '#28a745' }}>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    {/* Proceed to Checkout Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <button
                            style={{
                                background: 'linear-gradient(90deg, #635bff 60%, #4437c7 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '14px 36px',
                                fontWeight: 600,
                                fontSize: 18,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(99,91,255,0.08)',
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
