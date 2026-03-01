import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import AdminLayout from '../../../components/admin/AdminLayout';
import { downloadCsv } from '../../../utils/csv';
import AdvancedSearchPanel from '../../../components/common/AdvancedSearchPanel';
import { backendImageUrl } from '../../../utils/images';

const OrderList = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const currencyFormatter = useMemo(() => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    }, []);

    const pageSize = 6;

    const filterSections = useMemo(() => ([
        {
            key: 'status',
            title: 'Status',
            type: 'radio',
            value: statusFilter,
            onChange: (v) => setStatusFilter(String(v)),
            options: [
                { value: 'All', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'paid', label: 'Paid' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'cancelled', label: 'Cancelled' },
            ],
        },
    ]), [statusFilter]);

    const visibleOrders = useMemo(() => {
        const list = Array.isArray(orders) ? orders : [];
        const q = String(search || '').trim().toLowerCase();
        const status = String(statusFilter || 'All').toLowerCase();

        return list.filter((order) => {
            const orderStatus = String(order?.status || '').toLowerCase();
            if (status !== 'all' && orderStatus !== status) return false;
            if (!q) return true;

            const idText = String(order?.id ?? '');
            const emailText = String(order?.user_email || '').toLowerCase();
            const totalText = String(order?.total ?? '').toLowerCase();

            return (
                idText.includes(q) ||
                emailText.includes(q) ||
                orderStatus.includes(q) ||
                totalText.includes(q)
            );
        });
    }, [orders, search, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [visibleOrders.length]);

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

    const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedOrders = visibleOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <AdminLayout
            title="Manage Orders"
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

            {!error && orders.length > 0 && (
                <div style={{ maxWidth: 980, marginBottom: 14 }}>
                    <AdvancedSearchPanel
                        title="Advanced Search"
                        query={search}
                        onQueryChange={setSearch}
                        isOpen={filtersOpen}
                        onToggleOpen={() => setFiltersOpen((v) => !v)}
                        onSearch={() => setFiltersOpen(false)}
                        sections={filterSections}
                    />
                </div>
            )}

            {!error && orders.length > 0 && visibleOrders.length === 0 && (
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No matching orders.</div>
            )}

            {visibleOrders.length > 0 && (
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleOrders.length)} of {visibleOrders.length}
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                title={safePage <= 1 ? 'Already on first page' : 'Previous page'}
                            >
                                Prev
                            </button>
                            <div className="admin-pagination-meta">Page {safePage} / {totalPages}</div>
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                title={safePage >= totalPages ? 'Already on last page' : 'Next page'}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="admin-grid">
                        {pagedOrders.map((order) => (
                            <div
                                key={order.id}
                                className="admin-grid-card admin-grid-card--clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/admin/orders/${order.id}`);
                                    }
                                }}
                                title="View order details"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <img
                                            src={backendImageUrl(order.avatar_path)}
                                            alt=""
                                            width={38}
                                            height={38}
                                            style={{ objectFit: 'cover', borderRadius: 999 }}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = backendImageUrl('');
                                            }}
                                        />

                                        <div style={{ minWidth: 0 }}>
                                            <div className="admin-grid-title">Order #{order.id}</div>
                                            <div className="admin-grid-meta">User: {order.user_email || '—'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-grid-meta">Status: {order.status}</div>
                                <div className="admin-grid-meta">Total: {currencyFormatter.format(Number(order.total || 0))}</div>
                                <div className="admin-grid-meta">Date: {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</div>

                                <div className="admin-grid-actions admin-row-actions">
                                    <Link
                                        to={`/admin/orders/${order.id}?edit=1`}
                                        className="admin-link-btn admin-btn admin-btn--sm"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="admin-action-icon" aria-hidden="true">✎</span>
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(order.id);
                                        }}
                                        disabled={deletingId === order.id}
                                        title={deletingId === order.id ? 'Deleting...' : 'Delete'}
                                    >
                                        <span className="admin-action-icon" aria-hidden="true">✕</span>
                                        {deletingId === order.id ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default OrderList;