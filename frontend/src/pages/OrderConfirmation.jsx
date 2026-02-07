import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
    const location = useLocation();
    const { order } = location.state || {};
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderItems = async () => {
            if (!order?.id) return;
            try {
                const res = await axios.get(`http://localhost:5000/api/order-details/order/${order.id}`);
                setItems(res.data);
            } catch (err) {
                setError('Failed to load order items.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderItems();
    }, [order]);

    if (!order) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Order not found</h2>
                <Link to="/">Return to Home</Link>
            </div>
        );
    }
    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading receipt...</div>;
    }

    return (
        <div className="order-confirmation-bg" style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="order-confirmation-container" style={{ maxWidth: 700, width: '100%', margin: '3rem auto', padding: '2.5rem 2rem', borderRadius: 28, boxShadow: '0 12px 40px 0 rgba(99,91,255,0.13)', background: 'linear-gradient(120deg, #f8fffe 0%, #e3fcec 100%)', border: '2px solid #28a745', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(40,167,69,0.10)', padding: 12, border: '2.5px solid #28a745' }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="24" fill="#28a745"/><path d="M34 18L21.5 30.5L14 23" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h2 className="order-confirmation-title" style={{ textAlign: 'center', fontWeight: 900, marginBottom: 28, marginTop: 24, fontSize: 34, color: '#2196f3', letterSpacing: 1, textShadow: '0 2px 8px #b2f0ec' }}>Order Confirmed!</h2>
                <div className="order-confirmation-summary" style={{ marginBottom: 32, background: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(40,167,69,0.10)', border: '1.5px solid #28a745', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 18, marginBottom: 8, flex: '1 1 220px' }}><strong>Order ID:</strong> {order.id}</div>
                    <div style={{ fontSize: 18, marginBottom: 8, flex: '1 1 220px' }}><strong>Total:</strong> <span style={{ color: '#28a745', fontWeight: 700 }}>${order.total}</span></div>
                    <div style={{ fontSize: 18, marginBottom: 8, flex: '1 1 220px' }}><strong>Address:</strong> {order.address}</div>
                    <div style={{ fontSize: 18, marginBottom: 8, flex: '1 1 220px' }}><strong>Status:</strong> <span style={{ color: order.status === 'paid' ? '#28a745' : '#888', fontWeight: 700 }}>{order.status}</span></div>
                    <div style={{ fontSize: 18, marginBottom: 8, flex: '1 1 220px' }}><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="order-confirmation-items" style={{ marginBottom: 32, background: '#fff', borderRadius: 16, padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 className="order-confirmation-items-title" style={{ fontWeight: 800, marginBottom: 18, color: '#2196f3', fontSize: 22, letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase' }}>🧾 Order Items</h3>
                    {error && <div className="order-confirmation-items-error" style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                    <div className="order-confirmation-items-table-wrapper" style={{ overflowX: 'auto' }}>
                        <table className="order-confirmation-items-table" style={{ width: '100%', borderCollapse: 'collapse', background: '#f4fafd', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                            <thead style={{ background: '#e3fcec' }}>
                                <tr style={{ borderBottom: '2px solid #b2f0ec' }}>
                                    <th style={{ padding: '16px 12px', fontWeight: 800, fontSize: 16, textAlign: 'left', minWidth: 160, color: '#2196f3', letterSpacing: 1 }}>Product</th>
                                    <th style={{ padding: '16px 12px', fontWeight: 800, fontSize: 16, textAlign: 'right', minWidth: 100, color: '#2196f3', letterSpacing: 1 }}>Price</th>
                                    <th style={{ padding: '16px 12px', fontWeight: 800, fontSize: 16, textAlign: 'center', minWidth: 80, color: '#2196f3', letterSpacing: 1 }}>Quantity</th>
                                    <th style={{ padding: '16px 12px', fontWeight: 800, fontSize: 16, textAlign: 'right', minWidth: 120, color: '#2196f3', letterSpacing: 1 }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e3fcec', background: '#fff', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 12px', fontWeight: 600 }}>{item.product_name}</td>
                                        <td style={{ padding: '16px 12px', color: '#2196f3', fontWeight: 700, textAlign: 'right' }}>${item.price}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: 700, textAlign: 'right', color: '#28a745' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="order-confirmation-footer" style={{ marginBottom: 24, textAlign: 'center' }}>
                    <h3 className="order-confirmation-thankyou" style={{ fontWeight: 900, color: '#28a745', marginBottom: 8, fontSize: 24, letterSpacing: 1, textShadow: '0 2px 8px #b2f0ec' }}>Thank you for your purchase!</h3>
                    <Link className="order-confirmation-home-link" to="/" style={{ color: '#2196f3', fontWeight: 700, fontSize: 20, textDecoration: 'underline', letterSpacing: 1 }}>Return to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
