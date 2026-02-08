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
        return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading your orders...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0 }}>
            <div style={{ maxWidth: 1000, margin: '2.5rem auto', padding: '0', background: 'var(--surface-2)', borderRadius: 18, boxShadow: 'var(--shadow-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '1.75rem 1.5rem 1.25rem', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: 0.3 }}>My Orders</h2>
                    <div style={{ color: 'var(--muted)', marginTop: 10, fontWeight: 600 }}>
                    View your past orders and the items purchased in each order.
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>

                {error && (
                    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--danger)', padding: '12px 14px', borderRadius: 12, marginBottom: 16, fontWeight: 800 }}>
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div style={{ padding: '1rem 0' }}>
                        <div style={{ fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>You have no orders yet.</div>
                        <Link to="/products" style={{ color: 'var(--link)', fontWeight: 800, textDecoration: 'underline' }}>Browse products</Link>
                    </div>
                )}

                {orders.map((order) => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : '';
                    return (
                        <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: 18, padding: '1.25rem', marginBottom: 16, background: 'var(--surface-3)', boxShadow: 'var(--shadow-1)' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 20, letterSpacing: 0.2 }}>Order #{order.id}</div>
                                    <div style={{ color: 'var(--muted-2)', fontSize: 13, fontWeight: 700 }}>{createdAt}</div>
                                </div>

                                <Link
                                    to={`/order-details/${order.id}`}
                                    style={{
                                        background: 'var(--link)',
                                        color: 'var(--surface-2)',
                                        border: 'none',
                                        borderRadius: 12,
                                        padding: '10px 14px',
                                        fontWeight: 900,
                                        fontSize: 14,
                                        boxShadow: 'var(--shadow-1)',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        transition: 'filter 0.18s ease',
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.filter = 'brightness(0.92)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.filter = 'none'; }}
                                >
                                    View Details
                                </Link>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: 12,
                                alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 13 }}>Status:</div>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '6px 10px',
                                        borderRadius: 999,
                                        background: 'var(--nav-pill-bg)',
                                        border: '1px solid var(--border)',
                                        fontWeight: 900,
                                        color: order.status === 'paid' ? 'var(--success)' : 'var(--muted-2)',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        fontSize: 12,
                                    }}>
                                        {order.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                    <div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 13 }}>Total:</div>
                                    <div style={{ color: 'var(--success)', fontWeight: 900, fontSize: 16 }}>{currencyFormatter.format(Number(order.total || 0))}</div>
                                </div>

                                {order.address && (
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                                        <div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap' }}>Ship to:</div>
                                        <div style={{ color: 'var(--text)', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.address}</div>
                                    </div>
                                )}
                            </div>

                            {items.length > 0 && (
                                <div style={{ marginTop: 10, color: 'var(--muted-2)', fontWeight: 800, fontSize: 12 }}>
                                    {items.length} item{items.length === 1 ? '' : 's'}
                                </div>
                            )}
                        </div>
                    );
                })}

                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;
