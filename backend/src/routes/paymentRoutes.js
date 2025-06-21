const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

// Use your Stripe secret key (keep this safe!)
const stripe = Stripe('sk_test_51RbrrTQDAYM6vQvxJaJ3AwnXBn86Kq10IZ2byphL9UZndsN6joHyQ0xRbFNQamVU1d1HKtpD5KPtU1J2RS01pWXk00vBW7Yzy7');

// Create a PaymentIntent and return the client secret
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      // Optionally, you can add metadata, receipt_email, etc.
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
