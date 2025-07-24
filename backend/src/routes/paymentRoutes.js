const express = require('express');
const Stripe = require('stripe');
const router = express.Router();

// Use your Stripe secret key (keep this safe!)
const stripe = Stripe('sk_test_51RbrrTQDAYM6vQvxJaJ3AwnXBn86Kq10IZ2byphL9UZndsN6joHyQ0xRbFNQamVU1d1HKtpD5KPtU1J2RS01pWXk00vBW7Yzy7');

// Add models for order creation
const ShoppingCart = require('../models/ShoppingCart');
const Order = require('../models/Order');
const OrderDetails = require('../models/OrderDetails');

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

// Complete checkout: create order from cart after payment
router.post('/complete-checkout', async (req, res) => {
  try {
    const { user_id, address } = req.body;
    // 1. Get user's cart
    const cart = await ShoppingCart.getCartByUserId(user_id);
    if (!cart) return res.status(400).json({ error: 'No cart found for user' });

    // 2. Get cart items
    const items = await ShoppingCart.getItems(cart.id);
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    // 3. Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 4. Create order
    const order = await Order.createOrder({ user_id, total, address, status: 'paid' });

    // 5. Copy items to order_details
    for (const item of items) {
      await OrderDetails.createOrderDetail({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // 6. Clear cart
    await ShoppingCart.clearCart(cart.id);

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
