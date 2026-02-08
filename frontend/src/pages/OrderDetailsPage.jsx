import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), []);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setError('');
                setPageLoading(true);
                // Fetch order info
                const orderRes = await axios.get(`http://localhost:5000/api/orders/${id}`, { withCredentials: true });
                setOrder(orderRes.data);
                // Fetch order items
                const itemsRes = await axios.get(`http://localhost:5000/api/order-details/order/${id}`, { withCredentials: true });
                setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
            } catch (err) {
                setError('Failed to load order details.');
            } finally {
                setPageLoading(false);
            }
        };
        if (id && !loading) fetchOrder();
    }, [id, loading]);

    if (loading) return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (pageLoading) return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading order details...</div>;
    if (error) return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--danger)', fontWeight: 800 }}>{error}</div>;
    if (!order) return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Order not found.</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{
                maxWidth: 980,
                width: '100%',
                margin: '3rem 1rem',
                padding: 0,
                background: 'var(--surface-2)',
                borderRadius: 20,
                boxShadow: 'var(--shadow-2)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '2rem 1.5rem 1.25rem', background: 'var(--nav-bg)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: 0.3 }}>Order Details</h2>
                        <Link to="/my-orders" style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 900 }}>
                            &larr; Back to My Orders
                        </Link>
                    </div>
                </div>

                <div style={{ padding: '1.5rem 1.5rem 2rem', color: 'var(--text)' }}>
                    <div style={{
                        marginBottom: 18,
                        background: 'var(--surface-3)',
                        borderRadius: 16,
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-1)',
                        border: '1px solid var(--border)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                        gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Order ID:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.id}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Total:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--success)', whiteSpace: 'nowrap' }}>{currencyFormatter.format(Number(order.total || 0))}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Status:</div>
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

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Date:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {order.created_at ? new Date(order.created_at).toLocaleString() : ''}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0, gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Ship To:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.address}</div>
                        </div>
                    </div>

                    <div style={{
                        background: 'var(--surface-2)',
                        borderRadius: 16,
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-1)',
                        border: '1px solid var(--border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: 0.4 }}>Order Items</div>
                            <div style={{ fontWeight: 800, color: 'var(--muted-2)' }}>{items.length} item{items.length === 1 ? '' : 's'}</div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface-3)', borderRadius: 12, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                                <thead style={{ background: 'var(--nav-pill-bg)' }}>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'left', minWidth: 280, color: 'var(--text)', letterSpacing: 0.4 }}>Product</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'center', minWidth: 90, color: 'var(--text)', letterSpacing: 0.4 }}>Image</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'right', minWidth: 90, color: 'var(--text)', letterSpacing: 0.4 }}>Price</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'center', minWidth: 80, color: 'var(--text)', letterSpacing: 0.4 }}>Qty</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'right', minWidth: 110, color: 'var(--text)', letterSpacing: 0.4 }}>Line total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '12px', color: 'var(--muted-2)', fontWeight: 800 }}>No items found for this order.</td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                                <td style={{ padding: '14px 12px', fontWeight: 900 }}>
                                                    <Link to={`/products/${item.product_id}`} style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 900 }}>
                                                        {item.product_name}
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                                                    <Link to={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
                                                        <img
                                                            src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
                                                            alt={item.product_name}
                                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-3)', display: 'block' }}
                                                            onError={(e) => { e.currentTarget.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                                                        />
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '14px 12px', textAlign: 'right', color: 'var(--link)', fontWeight: 900 }}>
                                                    {currencyFormatter.format(Number(item.price || 0))}
                                                </td>
                                                <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 900, color: 'var(--text)' }}>{item.quantity}</td>
                                                <td style={{ padding: '14px 12px', textAlign: 'right', color: 'var(--success)', fontWeight: 900 }}>
                                                    {currencyFormatter.format(Number(item.price || 0) * Number(item.quantity || 0))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
