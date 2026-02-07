import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import AdminLayout from '../../../components/admin/AdminLayout';

const UserOrderDetails = () => {
	const { user, loading } = useAuth();
	const location = useLocation();
	const { orderId } = useParams();
	const [searchParams] = useSearchParams();
	const isEditMode = searchParams.get('edit') === '1';

	const [order, setOrder] = useState(null);
	const [pageLoading, setPageLoading] = useState(true);
	const [error, setError] = useState('');
	const [statusDraft, setStatusDraft] = useState('');
	const [saving, setSaving] = useState(false);

	const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), []);

	useEffect(() => {
		const fetchOrder = async () => {
			if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
				setPageLoading(false);
				return;
			}

			try {
				setError('');
				const res = await axios.get(`http://localhost:5000/api/orders/admin/${orderId}`, {
					withCredentials: true,
				});
				setOrder(res.data);
			} catch (err) {
				const message = err?.response?.data?.error || 'Failed to load order details.';
				setError(message);
			} finally {
				setPageLoading(false);
			}
		};

		if (!loading) {
			fetchOrder();
		}
	}, [user, loading, orderId]);

	useEffect(() => {
		if (!order) return;
		setStatusDraft(String(order.status || 'pending'));
	}, [order]);

	const handleSaveStatus = async () => {
		if (!order) return;
		try {
			setSaving(true);
			setError('');
			await axios.put(
				`http://localhost:5000/api/orders/${order.id}/status`,
				{ status: statusDraft },
				{ withCredentials: true }
			);
			setOrder((prev) => (prev ? { ...prev, status: statusDraft } : prev));
		} catch (err) {
			const message = err?.response?.data?.error || 'Failed to update order status.';
			setError(message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
	}

	if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (pageLoading) {
		return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading order details...</div>;
	}

	if (error) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				<div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
				<Link to="/admin/orders" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>&larr; Back to Orders</Link>
			</div>
		);
	}

	if (!order) {
		return (
			<div style={{ padding: '2rem', textAlign: 'center' }}>
				Order not found.
				<div style={{ marginTop: 12 }}>
					<Link to="/admin/orders" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>&larr; Back to Orders</Link>
				</div>
			</div>
		);
	}

	const items = Array.isArray(order.items) ? order.items : [];

	return (
		<AdminLayout
			title={`Order #${order.id}`}
			subtitle={order.user_email ? `Customer: ${order.user_email}` : 'Order details'}
			actions={(
				<Link to="/admin/orders" className="admin-link-btn admin-btn">
					Back to Orders
				</Link>
			)}
		>
			{error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

			<div style={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: 16,
				marginBottom: 16,
				padding: '12px 14px',
				borderRadius: 14,
				background: 'var(--surface-3)',
				border: '1px solid var(--border)',
			}}>
				<div style={{ flex: '1 1 260px' }}>
					<div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Summary</div>
					<div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
						<strong>Status:</strong>
						{isEditMode ? (
							<>
								<select
									className="admin-select"
									value={statusDraft}
									onChange={(e) => setStatusDraft(e.target.value)}
									style={{ width: 180 }}
								>
									<option value="pending">pending</option>
									<option value="paid">paid</option>
									<option value="shipped">shipped</option>
									<option value="cancelled">cancelled</option>
								</select>
								<button
									type="button"
									className="admin-btn admin-btn--sm admin-btn--primary"
									onClick={handleSaveStatus}
									disabled={saving || String(statusDraft) === String(order.status)}
								>
									{saving ? 'Saving…' : 'Save'}
								</button>
							</>
						) : (
							<span style={{ color: order.status === 'paid' ? 'var(--success)' : 'var(--muted)', fontWeight: 900 }}>{order.status}</span>
						)}
					</div>
					<div><strong>Total:</strong> <span style={{ color: 'var(--success)', fontWeight: 900 }}>{currencyFormatter.format(Number(order.total || 0))}</span></div>
					<div><strong>Date:</strong> <span style={{ color: 'var(--muted)' }}>{order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</span></div>
				</div>
				<div style={{ flex: '1 1 260px' }}>
					<div style={{ color: 'var(--muted)', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shipping</div>
					<div style={{ marginTop: 8, color: 'var(--muted)' }}>{order.address || '—'}</div>
				</div>
			</div>

			<div style={{ fontWeight: 900, marginBottom: 10 }}>Purchased Items</div>
			<div className="admin-table">
				<table>
					<thead>
						<tr>
							<th>Product</th>
							<th style={{ width: 140, textAlign: 'center' }}>Image</th>
							<th style={{ width: 140, textAlign: 'right' }}>Price</th>
							<th style={{ width: 120, textAlign: 'center' }}>Qty</th>
							<th style={{ width: 160, textAlign: 'right' }}>Line Total</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 ? (
							<tr>
								<td colSpan={5} style={{ color: 'var(--muted)', fontWeight: 700 }}>No items found for this order.</td>
							</tr>
						) : (
							items.map((item) => (
								<tr key={item.id}>
									<td style={{ fontWeight: 900 }}>
										<Link to={`/products/${item.product_id}`} style={{ color: 'var(--link)', fontWeight: 900 }}>
											{item.product_name}
										</Link>
									</td>
									<td style={{ textAlign: 'center' }}>
										<Link to={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
											<img
												src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
												alt={item.product_name}
												style={{ width: 64, height: 64, objectFit: 'cover' }}
												onError={(e) => {
													e.target.onerror = null;
													e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
												}}
											/>
										</Link>
									</td>
									<td style={{ textAlign: 'right', fontWeight: 900 }}>
										{currencyFormatter.format(Number(item.price || 0))}
									</td>
									<td style={{ textAlign: 'center', fontWeight: 900 }}>{item.quantity}</td>
									<td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 900 }}>
										{currencyFormatter.format(Number(item.price || 0) * Number(item.quantity || 0))}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</AdminLayout>
	);
};

export default UserOrderDetails;
