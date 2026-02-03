import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';

const UserOrderDetails = () => {
	const { user, loading } = useAuth();
	const location = useLocation();
	const { orderId } = useParams();

	const [order, setOrder] = useState(null);
	const [pageLoading, setPageLoading] = useState(true);
	const [error, setError] = useState('');

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
		<div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
			<div style={{ maxWidth: 1100, margin: '2.5rem auto', padding: '2rem 1.5rem', background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
					<h2 style={{ fontWeight: 900, margin: 0, color: '#ff9800' }}>Order #{order.id}</h2>
					<Link to="/admin/orders" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>&larr; Back to Orders</Link>
				</div>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 20, padding: '1rem', borderRadius: 14, background: 'linear-gradient(120deg, #f8fffe 0%, #f4fafd 100%)', border: '1px solid #e3fcec' }}>
					<div style={{ flex: '1 1 240px' }}>
						<div><strong>User Email:</strong> {order.user_email || '—'}</div>
						<div><strong>Status:</strong> <span style={{ color: order.status === 'paid' ? '#28a745' : '#888', fontWeight: 800 }}>{order.status}</span></div>
						<div><strong>Total:</strong> <span style={{ color: '#28a745', fontWeight: 900 }}>{currencyFormatter.format(Number(order.total || 0))}</span></div>
						<div><strong>Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}</div>
					</div>
					<div style={{ flex: '1 1 240px' }}>
						<div><strong>Shipping Address:</strong></div>
						<div style={{ color: '#444', marginTop: 4 }}>{order.address || '—'}</div>
					</div>
				</div>

				<h3 style={{ fontWeight: 900, marginBottom: 12, color: '#232526' }}>Purchased Items</h3>
				<div style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12 }}>
						<thead>
							<tr style={{ background: '#232526' }}>
								<th style={{ padding: '12px 14px', textAlign: 'left', color: '#ff9800' }}>Product</th>
								<th style={{ padding: '12px 14px', textAlign: 'center', color: '#ff9800' }}>Image</th>
								<th style={{ padding: '12px 14px', textAlign: 'right', color: '#ff9800' }}>Price</th>
								<th style={{ padding: '12px 14px', textAlign: 'center', color: '#ff9800' }}>Qty</th>
								<th style={{ padding: '12px 14px', textAlign: 'right', color: '#ff9800' }}>Line Total</th>
							</tr>
						</thead>
						<tbody>
							{items.length === 0 ? (
								<tr>
									<td colSpan={5} style={{ padding: '14px', color: '#666' }}>No items found for this order.</td>
								</tr>
							) : (
								items.map((item) => (
									<tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
										<td style={{ padding: '12px 14px', fontWeight: 800 }}>
											<Link to={`/products/${item.product_id}`} style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 800 }}>
												{item.product_name}
											</Link>
										</td>
										<td style={{ padding: '12px 14px', textAlign: 'center' }}>
											<Link to={`/products/${item.product_id}`} style={{ display: 'inline-block' }}>
												<img
													src={`http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`}
													alt={item.product_name}
													style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid #eee' }}
													onError={(e) => {
														e.target.onerror = null;
														e.target.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
													}}
												/>
											</Link>
										</td>
										<td style={{ padding: '12px 14px', textAlign: 'right', color: '#2196f3', fontWeight: 900 }}>
											{currencyFormatter.format(Number(item.price || 0))}
										</td>
										<td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800 }}>{item.quantity}</td>
										<td style={{ padding: '12px 14px', textAlign: 'right', color: '#28a745', fontWeight: 900 }}>
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

export default UserOrderDetails;
