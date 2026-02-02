import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const MyOrdersPage = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }, []);

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) {
                setPageLoading(false);
                return;
            }

            try {
                setError('');
                const res = await axios.get('http://localhost:5000/api/orders/my', {
                    withCredentials: true,
                });
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                const message = err?.response?.data?.error || 'Failed to load your orders.';
                setError(message);
            } finally {
                setPageLoading(false);
            }
        };

        if (!loading) {
            fetchMyOrders();
        }
    }, [user, loading]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your orders...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0f7fa 0%, #e3fcec 100%)', padding: 0 }}>
            <div style={{ maxWidth: 1000, margin: '2.5rem auto', padding: '1.75rem 1.5rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontWeight: 900, marginBottom: 18, color: '#2196f3' }}>My Orders</h2>
                <div style={{ color: '#666', marginBottom: 18 }}>
                    View your past orders and the items purchased in each order.
                </div>

                {error && (
                    <div style={{ background: '#ffecec', border: '1px solid #ffb3b3', color: '#b00020', padding: '12px 14px', borderRadius: 10, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>You have no orders yet.</div>
                        <Link to="/products" style={{ color: '#2196f3', fontWeight: 700, textDecoration: 'underline' }}>Browse products</Link>
                    </div>
                )}

                {orders.map((order) => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : '';
                    return (
                        <div key={order.id} style={{ border: '1.5px solid #e3fcec', borderRadius: 18, padding: '1.25rem', marginBottom: 20, background: 'linear-gradient(120deg, #f8fffe 0%, #f4fafd 100%)', boxShadow: '0 2px 12px rgba(33,150,243,0.07)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ fontWeight: 900, color: '#232526', fontSize: 20 }}>Order #{order.id}</div>
                                <div style={{ color: '#666', fontSize: 15 }}>{createdAt}</div>
                                <Link to={`/order-details/${order.id}`} style={{
                                    background: 'linear-gradient(90deg, #2196f3 60%, #21cbf3 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 22px',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    boxShadow: '0 2px 8px rgba(33,150,243,0.08)',
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    marginLeft: 'auto',
                                    transition: 'background 0.2s, box-shadow 0.2s',
                                }}>View Details</Link>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between', marginBottom: 10 }}>
                                <div><strong>Status:</strong> <span style={{ color: order.status === 'paid' ? '#28a745' : '#888', fontWeight: 800 }}>{order.status}</span></div>
                                <div><strong>Total:</strong> <span style={{ color: '#28a745', fontWeight: 900 }}>{currencyFormatter.format(Number(order.total || 0))}</span></div>
                                {order.address && (
                                    <div style={{ color: '#444' }}><strong>Ship to:</strong> {order.address}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyOrdersPage;
