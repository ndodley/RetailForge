import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import AdminLayout from '../../../components/admin/AdminLayout';
import { downloadCsv } from '../../../utils/csv';

const OrderList = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }, []);

    const handleDelete = async (orderId) => {
        if (!orderId) return;
        if (!window.confirm(`Delete order #${orderId}? This cannot be undone.`)) return;

        try {
            setDeletingId(orderId);
            await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                withCredentials: true,
            });
            setOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to delete order.';
            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

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
        <AdminLayout
            title="Admin Orders"
            subtitle="View all orders across the store, including the customer email."
            actions={(
                <button
                    type="button"
                    className="admin-btn"
                    onClick={() => downloadCsv({ rows: orders, filename: 'orders.csv' })}
                    disabled={orders.length === 0}
                    title={orders.length === 0 ? 'No data to export' : 'Download CSV'}
                >
                    Download CSV
                </button>
            )}
        >
            {error && (
                <div className="admin-alert admin-alert--error">
                    {error}
                </div>
            )}

            {!error && orders.length === 0 && (
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No orders found.</div>
            )}

            {orders.length > 0 && (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User Email</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'center' }}>Details</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 900 }}>{order.id}</td>
                                    <td style={{ fontWeight: 800 }}>{order.user_email || '—'}</td>
                                    <td>
                                        <span style={{ color: order.status === 'paid' ? 'var(--success)' : 'var(--muted)', fontWeight: 900 }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--success)' }}>
                                        {currencyFormatter.format(Number(order.total || 0))}
                                    </td>
                                    <td style={{ color: 'var(--muted)' }}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Link
                                            to={`/admin/orders/${order.id}`}
                                            className="admin-link-btn admin-btn admin-btn--sm admin-btn--primary"
                                        >
                                            <span className="admin-action-icon" aria-hidden="true">↗</span>
                                            View
                                        </Link>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="admin-row-actions" style={{ justifyContent: 'center' }}>
                                            <Link
                                                to={`/admin/orders/${order.id}?edit=1`}
                                                className="admin-link-btn admin-btn admin-btn--sm"
                                            >
                                                <span className="admin-action-icon" aria-hidden="true">✎</span>
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                className="admin-btn admin-btn--sm admin-btn--danger"
                                                onClick={() => handleDelete(order.id)}
                                                disabled={deletingId === order.id}
                                                title={deletingId === order.id ? 'Deleting...' : 'Delete'}
                                            >
                                                <span className="admin-action-icon" aria-hidden="true">✕</span>
                                                {deletingId === order.id ? 'Deleting…' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
};

export default OrderList;