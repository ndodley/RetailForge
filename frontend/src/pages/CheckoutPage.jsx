import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useLocation } from "react-router-dom";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from "axios";

const CheckoutPage = () => {
    const location = useLocation();
    const { cartTotal, cartItems } = location.state || {};
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [address, setAddress] = useState('');
    const [localCartItems, setLocalCartItems] = useState(cartItems || []);
    const { user } = useAuth();

    const safeCartItems = Array.isArray(localCartItems) ? localCartItems : [];
    const safeCartTotal = typeof cartTotal === 'number'
        ? cartTotal
        : safeCartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    const [stripeTheme, setStripeTheme] = useState({
        text: '#000000',
        muted: '#6b7280',
        border: '#d1d5db',
        surface: '#ffffff',
    });

    useEffect(() => {
        const readTheme = () => {
            const styles = getComputedStyle(document.documentElement);
            const readVar = (name, fallback) => {
                const value = styles.getPropertyValue(name).trim();
                return value || fallback;
            };

            setStripeTheme({
                text: readVar('--text', '#000000'),
                muted: readVar('--muted-2', '#6b7280'),
                border: readVar('--border', '#d1d5db'),
                surface: readVar('--surface-2', '#ffffff'),
            });
        };

        readTheme();

        const observer = new MutationObserver(() => readTheme());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const cardElementOptions = useMemo(() => ({
        style: {
            base: {
                fontSize: '16px',
                color: stripeTheme.text,
                iconColor: stripeTheme.text,
                '::placeholder': { color: stripeTheme.muted },
            },
            invalid: {
                color: 'var(--danger)',
            },
        },
    }), [stripeTheme.muted, stripeTheme.text]);

    // Handle Stripe payment form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');
        setSuccess('');
        try {
            // 1. Create PaymentIntent on backend
            const res = await axios.post('http://localhost:5000/api/payment/create-payment-intent', {
                amount: Math.round(cartTotal * 100), // Stripe expects cents
            });
            const clientSecret = res.data.clientSecret;

            // 2. Confirm card payment on frontend
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
                // Place order in backend
                try {
                    const orderRes = await axios.post('http://localhost:5000/api/payment/complete-checkout', {
                        user_id: user?.id,
                        address
                    });
                    // Clear cart in frontend state
                    setLocalCartItems([]);
                    // Redirect to order confirmation page with order details
                    navigate('/order-confirmation', { state: { order: orderRes.data.order } });
                } catch (orderErr) {
                    setError('Order creation failed. Please contact support.');
                }
            }
        } catch (err) {
            setError('Payment failed. Please try again.');
        }
        setProcessing(false);
    };

    return (
        <div style={{ background: 'var(--app-bg)', padding: '2rem 1rem' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem', background: 'var(--surface-2)', borderRadius: 16, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                <h2 style={{ textAlign: 'center', fontWeight: 800, marginBottom: 32, color: 'var(--text)' }}>Checkout</h2>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)' }}>Order Summary</div>

                    <div style={{
                        marginTop: 14,
                        padding: 14,
                        borderRadius: 12,
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-1)'
                    }}>
                        {safeCartItems.length === 0 ? (
                            <div style={{ color: 'var(--muted-2)', fontWeight: 700 }}>No items found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {safeCartItems.map((item) => {
                                    const imageSrc = `http://localhost:5000${item.image_path || '/images/other_images/dummy_product.jpg'}`;
                                    const itemPrice = Number(item.price || 0);
                                    const itemQty = Number(item.quantity || 0);
                                    const lineTotal = itemPrice * itemQty;

                                    return (
                                        <div key={item.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 12,
                                            padding: 12,
                                            borderRadius: 12,
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface-2)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                                                <img
                                                    src={imageSrc}
                                                    alt={item.name}
                                                    style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-3)', flexShrink: 0 }}
                                                    onError={(e) => {
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = 'http://localhost:5000/images/other_images/dummy_product.jpg';
                                                    }}
                                                />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ color: 'var(--text)', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ color: 'var(--muted-2)', fontWeight: 700, fontSize: 13 }}>
                                                        Qty {itemQty} · ${itemPrice.toFixed(2)} each
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ color: 'var(--text)', fontWeight: 900, flexShrink: 0 }}>
                                                ${lineTotal.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 20, marginTop: 16, color: 'var(--text)' }}>
                        Total: <span style={{ color: 'var(--success)' }}>${safeCartTotal.toFixed(2)}</span>
                    </div>
                </div>
                {/* Stripe payment form */}
                <form onSubmit={handleSubmit}>
                    {/* Address input */}
                    <input
                        type="text"
                        placeholder="Shipping Address"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        required
                        style={{ width: '100%', marginBottom: 16, padding: 10, fontSize: 16, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', outline: 'none' }}
                    />
                    {/* CardElement securely collects card details */}
                    <div style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: `1.5px solid ${stripeTheme.border}`,
                        background: stripeTheme.surface,
                    }}>
                        <CardElement options={cardElementOptions} />
                    </div>
                    <button
                        type="submit"
                        disabled={!stripe || processing}
                        style={{
                            background: 'var(--link)',
                            color: 'var(--surface-2)',
                            border: 'none',
                            borderRadius: 8,
                            padding: '14px 36px',
                            fontWeight: 600,
                            fontSize: 18,
                            cursor: 'pointer',
                            marginTop: 24,
                            width: '100%',
                        }}
                    >
                        {processing ? 'Processing...' : 'Pay with Stripe'}
                    </button>
                </form>
                {error && <div style={{ color: 'var(--danger)', marginTop: 16, fontWeight: 700 }}>{error}</div>}
                {success && <div style={{ color: 'var(--success)', marginTop: 16, fontWeight: 700 }}>{success}</div>}
            </div>
        </div>
    );
};

export default CheckoutPage;
