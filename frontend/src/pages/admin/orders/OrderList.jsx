import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';

const OrderList = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
                setPageLoading(false);
                return;
            }

            try {
                setError('');
                const res = await axios.get('http://localhost:5000/api/orders/admin', {
                    withCredentials: true,
                });
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                const message = err?.response?.data?.error || 'Failed to load orders.';
                setError(message);
            } finally {
                setPageLoading(false);
            }
        };

        if (!loading) {
            fetchOrders();
        }
    }, [user, loading]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading all orders...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
            <div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '2rem 1.5rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontWeight: 900, marginBottom: 12, color: '#ff9800' }}>Admin Orders</h2>
                <div style={{ color: '#666', marginBottom: 18 }}>
                    View all orders across the store, including the customer email.
                </div>

                {error && (
                    <div style={{ background: '#ffecec', border: '1px solid #ffb3b3', color: '#b00020', padding: '12px 14px', borderRadius: 10, marginBottom: 16 }}>
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div style={{ padding: '1rem 0', color: '#555' }}>No orders found.</div>
                )}

                {orders.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12 }}>
                            <thead>
                                <tr style={{ background: '#232526' }}>
                                    <th style={{ padding: '12px 14px', textAlign: 'left', color: '#ff9800' }}>Order ID</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'left', color: '#ff9800' }}>User Email</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'left', color: '#ff9800' }}>Status</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'right', color: '#ff9800' }}>Total</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'left', color: '#ff9800' }}>Date</th>
                                    <th style={{ padding: '12px 14px', textAlign: 'center', color: '#ff9800' }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '12px 14px', fontWeight: 900, color: '#232526' }}>{order.id}</td>
                                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>{order.user_email || '—'}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ color: order.status === 'paid' ? '#28a745' : '#888', fontWeight: 800 }}>{order.status}</span>
                                        </td>
                                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 900, color: '#28a745' }}>
                                            {currencyFormatter.format(Number(order.total || 0))}
                                        </td>
                                        <td style={{ padding: '12px 14px', color: '#666' }}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
                                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                            <Link to={`/admin/orders/${order.id}`} style={{
                                                background: 'linear-gradient(90deg, #ff9800 60%, #ff5722 100%)',
                                                color: '#fff',
                                                borderRadius: 8,
                                                padding: '8px 14px',
                                                fontWeight: 800,
                                                textDecoration: 'none',
                                                display: 'inline-block',
                                            }}>View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderList;