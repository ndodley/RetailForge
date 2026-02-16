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
            <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>
                <h2 style={{ marginTop: 0 }}>Order not found</h2>
                <Link to="/" style={{ color: 'var(--link)', fontWeight: 700 }}>Return to Home</Link>
            </div>
        );
    }
    if (loading) {
        return <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading receipt...</div>;
    }

    return (
        <div className="order-confirmation-bg" style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="order-confirmation-container" style={{
                maxWidth: 760,
                width: '100%',
                margin: '3rem auto',
                padding: '0',
                borderRadius: 24,
                boxShadow: 'var(--shadow-2)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '2.25rem 2rem 1.5rem',
                    background: 'var(--nav-bg)',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 999,
                            display: 'grid',
                            placeItems: 'center',
                            background: 'var(--success)',
                            boxShadow: 'var(--shadow-1)',
                            border: '2px solid var(--border)',
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="var(--surface-2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 0.4, color: 'var(--text)' }}>Order Confirmed</div>
                            <div style={{ marginTop: 6, fontWeight: 700, color: 'var(--muted)' }}>
                                Thanks — your payment was successful.
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1.75rem 2rem 2rem', color: 'var(--text)' }}>
                    <div className="order-confirmation-summary" style={{
                        marginBottom: 24,
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
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Total:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--success)', whiteSpace: 'nowrap' }}>${order.total}</div>
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
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{new Date(order.created_at).toLocaleString()}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0, gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>Ship To:</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.address}</div>
                        </div>
                    </div>

                    <div className="order-confirmation-items" style={{
                        marginBottom: 24,
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

                        {error && <div className="order-confirmation-items-error" style={{ color: 'var(--danger)', marginBottom: 12, fontWeight: 800 }}>{error}</div>}

                        <div className="order-confirmation-items-table-wrapper" style={{ overflowX: 'auto' }}>
                            <table className="order-confirmation-items-table" style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--surface-3)', borderRadius: 12, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                                <thead style={{ background: 'var(--nav-pill-bg)' }}>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'left', minWidth: 280, color: 'var(--text)', letterSpacing: 0.4 }}>Product</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'right', minWidth: 90, color: 'var(--text)', letterSpacing: 0.4 }}>Price</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'center', minWidth: 80, color: 'var(--text)', letterSpacing: 0.4 }}>Qty</th>
                                        <th style={{ padding: '14px 12px', fontWeight: 900, fontSize: 14, textAlign: 'right', minWidth: 110, color: 'var(--text)', letterSpacing: 0.4 }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                            <td style={{ padding: '14px 12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Link to={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
                                                        <img
                                                            src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
                                                            alt={item.product_name}
                                                            width="56"
                                                            height="56"
                                                            style={{ objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surface-3)', display: 'block' }}
                                                            onError={(e) => { e.currentTarget.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                                                        />
                                                    </Link>
                                                    <div style={{ minWidth: 0 }}>
                                                        <Link to={`/products/${item.product_id}`} style={{
                                                            color: 'var(--text)',
                                                            fontWeight: 900,
                                                            textDecoration: 'none',
                                                            display: 'block',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            maxWidth: 360,
                                                        }}>
                                                            {item.product_name}
                                                        </Link>
                                                        <div style={{ marginTop: 4, color: 'var(--muted-2)', fontWeight: 700, fontSize: 12 }}>
                                                            Product ID: {item.product_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', color: 'var(--link)', fontWeight: 900, textAlign: 'right' }}>${item.price}</td>
                                            <td style={{ padding: '14px 12px', fontWeight: 900, textAlign: 'center', color: 'var(--text)' }}>{item.quantity}</td>
                                            <td style={{ padding: '14px 12px', fontWeight: 900, textAlign: 'right', color: 'var(--success)' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="order-confirmation-footer" style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 900, color: 'var(--success)', marginBottom: 10, fontSize: 18, letterSpacing: 0.3 }}>Thank you for your purchase!</div>
                        <Link className="order-confirmation-home-link" to="/" style={{ color: 'var(--link)', fontWeight: 900, fontSize: 16, textDecoration: 'underline', letterSpacing: 0.3 }}>Return to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
