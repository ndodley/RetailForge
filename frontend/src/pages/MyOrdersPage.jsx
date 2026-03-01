import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../components/common/AdvancedSearchPanel';
import { useAuth } from '../hooks/useAuth';

const MyOrdersPage = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [activeOrderId, setActiveOrderId] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('any');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const pageSize = 6;

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

    useEffect(() => {
        setPage(1);
    }, [orders.length, search, statusFilter, sortBy, sortOrder]);

    const filterSections = useMemo(() => {
        return [
            {
                key: 'status',
                title: 'Status',
                type: 'radio',
                value: statusFilter,
                onChange: (v) => setStatusFilter(String(v)),
                options: [
                    { value: 'any', label: 'Any' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'shipped', label: 'Shipped' },
                    { value: 'cancelled', label: 'Cancelled' },
                ],
            },
            {
                key: 'sort',
                title: 'Sort',
                type: 'radio',
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
                options: [
                    { value: 'date', label: 'Date' },
                    { value: 'total', label: 'Total' },
                    { value: 'id', label: 'Order ID' },
                ],
            },
            {
                key: 'order',
                title: 'Order',
                type: 'radio',
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v)),
                options: [
                    { value: 'desc', label: 'Descending' },
                    { value: 'asc', label: 'Ascending' },
                ],
            },
        ];
    }, [statusFilter, sortBy, sortOrder]);

    const visibleOrders = useMemo(() => {
        let visible = Array.isArray(orders) ? orders : [];

        const query = search.trim().toLowerCase();
        if (query) {
            visible = visible.filter((order) => {
                const idText = String(order?.id ?? '');
                const statusText = String(order?.status ?? '');
                const addressText = String(order?.address ?? '');
                return (
                    idText.toLowerCase().includes(query)
                    || statusText.toLowerCase().includes(query)
                    || addressText.toLowerCase().includes(query)
                );
            });
        }

        if (statusFilter !== 'any') {
            visible = visible.filter((order) => String(order?.status || '').toLowerCase() === statusFilter);
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        visible = [...visible].sort((a, b) => {
            if (sortBy === 'total') return multiplier * (Number(a?.total || 0) - Number(b?.total || 0));
            if (sortBy === 'id') return multiplier * (Number(a?.id || 0) - Number(b?.id || 0));

            // date (default)
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            return multiplier * (aTime - bTime);
        });

        return visible;
    }, [orders, search, statusFilter, sortBy, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedOrders = visibleOrders.slice((safePage - 1) * pageSize, safePage * pageSize);

    if (loading) {
        return <div style={{ background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ background: 'var(--app-bg)', padding: '2rem', textAlign: 'center', color: 'var(--text)' }}>Loading your orders...</div>;
    }

    return (
        <div style={{ background: 'var(--app-bg)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0', background: 'var(--surface-2)', borderRadius: 18, boxShadow: 'var(--shadow-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
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

                {!error && orders.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
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

                {!error && visibleOrders.length > 0 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 16,
                    }}>
                        <div style={{ color: 'var(--muted-2)', fontWeight: 800 }}>
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleOrders.length)} of {visibleOrders.length}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button
                                type="button"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                                    opacity: safePage <= 1 ? 0.6 : 1,
                                }}
                            >
                                Prev
                            </button>

                            <div style={{ color: 'var(--muted-2)', fontWeight: 900 }}>
                                Page {safePage} / {totalPages}
                            </div>

                            <button
                                type="button"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                style={{
                                    background: 'var(--surface-3)',
                                    color: 'var(--text)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    fontWeight: 900,
                                    cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                                    opacity: safePage >= totalPages ? 0.6 : 1,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {!error && orders.length > 0 && visibleOrders.length === 0 && (
                    <div style={{ padding: '1rem 0', color: 'var(--muted)', fontWeight: 800 }}>
                        No orders match your search.
                    </div>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 16,
                    alignItems: 'stretch',
                }}>
                {pagedOrders.map((order) => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : '';
                    const normalizedStatus = String(order.status || '').toLowerCase();
                    const isActive = Number(activeOrderId) === Number(order.id);
                    return (
                        <div
                            key={order.id}
                            role="button"
                            tabIndex={0}
                            title="View order details"
                            onClick={() => navigate(`/order-details/${order.id}`)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    navigate(`/order-details/${order.id}`);
                                }
                            }}
                            onMouseEnter={() => setActiveOrderId(order.id)}
                            onMouseLeave={() => setActiveOrderId(null)}
                            onFocus={() => setActiveOrderId(order.id)}
                            onBlur={() => setActiveOrderId(null)}
                            style={{
                                border: '1px solid var(--border)',
                                borderColor: isActive ? 'var(--link)' : 'var(--border)',
                                borderRadius: 18,
                                padding: '1.1rem',
                                background: isActive ? 'var(--nav-pill-bg)' : 'var(--surface-3)',
                                boxShadow: 'var(--shadow-1)',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'filter 120ms ease, background 120ms ease, border-color 120ms ease',
                                outline: 'none',
                            }}
                        >
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ fontWeight: 900, color: 'var(--text)', fontSize: 20, letterSpacing: 0.2 }}>Order #{order.id}</div>
                                    <div style={{ color: 'var(--muted-2)', fontSize: 13, fontWeight: 700 }}>{createdAt}</div>
                                </div>
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
                                        color: (normalizedStatus === 'paid' || normalizedStatus === 'shipped') ? 'var(--success)' : 'var(--muted-2)',
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
        </div>
    );
};

export default MyOrdersPage;
