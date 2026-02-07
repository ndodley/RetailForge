import React, { useState } from "react";
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
        <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0 }}>
            <div style={{ maxWidth: 500, margin: '3rem auto', padding: '2rem 1.5rem', background: 'var(--surface-2)', borderRadius: 16, boxShadow: 'var(--shadow-1)', border: '1px solid var(--border)' }}>
                <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 32 }}>Checkout</h2>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>Order Summary</div>
                    <ul style={{ padding: 0, listStyle: 'none', margin: '16px 0' }}>
                        {cartItems && cartItems.map(item => (
                            <li key={item.id} style={{ marginBottom: 8, color: 'var(--text)' }}>
                                {item.name} x {item.quantity} <span style={{ color: 'var(--muted-2)' }}>(${item.price} each)</span>
                            </li>
                        ))}
                    </ul>
                    <div style={{ fontWeight: 700, fontSize: 20, marginTop: 16 }}>
                        Total: <span style={{ color: '#28a745' }}>${cartTotal?.toFixed(2)}</span>
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
                    <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
                    <button
                        type="submit"
                        disabled={!stripe || processing}
                        style={{
                            background: '#635bff',
                            color: '#fff',
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
                {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
                {success && <div style={{ color: 'green', marginTop: 16 }}>{success}</div>}
            </div>
        </div>
    );
};

export default CheckoutPage;
