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

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (pageLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading order details...</div>;
    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0f7fa 0%, #e3fcec 100%)', padding: 0 }}>
            <div style={{ maxWidth: 900, margin: '2.5rem auto', padding: '2rem 1.5rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontWeight: 900, marginBottom: 18, color: '#2196f3' }}>Order Details</h2>
                <div style={{ marginBottom: 18 }}>
                    <Link to="/my-orders" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 600 }}>&larr; Back to My Orders</Link>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, marginBottom: 24 }}>
                    <div style={{ flex: '1 1 260px' }}>
                        <div><strong>Order ID:</strong> {order.id}</div>
                        <div><strong>Status:</strong> <span style={{ color: order.status === 'paid' ? '#28a745' : '#888', fontWeight: 800 }}>{order.status}</span></div>
                        <div><strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
                        <div><strong>Total:</strong> <span style={{ color: '#28a745', fontWeight: 900 }}>{currencyFormatter.format(Number(order.total || 0))}</span></div>
                    </div>
                    <div style={{ flex: '1 1 260px' }}>
                        <div><strong>Shipping Address:</strong></div>
                        <div style={{ color: '#444', marginTop: 4 }}>{order.address}</div>
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12 }}>
                        <thead>
                            <tr style={{ background: '#e3fcec' }}>
                                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Image</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Price</th>
                                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Line total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '12px', color: '#666' }}>No items found for this order.</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                                            <Link to={`/products/${item.product_id}`} style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>
                                                {item.product_name}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                            <Link to={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
                                                {item.image_path ? (
                                                    <img
                                                        src={`http://localhost:5000${item.image_path}`}
                                                        alt={item.product_name}
                                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                                        onError={e => { e.target.onerror = null; e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg'; }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={'http://localhost:5000/images/other_images/dummy_product.jpg'}
                                                        alt="No image"
                                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                                    />
                                                )}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#2196f3', fontWeight: 800 }}>
                                            {currencyFormatter.format(Number(item.price || 0))}
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{item.quantity}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#28a745', fontWeight: 900 }}>
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
    );
};

export default OrderDetailsPage;
