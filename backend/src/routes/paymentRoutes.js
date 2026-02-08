const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const pool = require('../db');

// Use your Stripe secret key (keep this safe!)
const stripe = Stripe('sk_test_51RbrrTQDAYM6vQvxJaJ3AwnXBn86Kq10IZ2byphL9UZndsN6joHyQ0xRbFNQamVU1d1HKtpD5KPtU1J2RS01pWXk00vBW7Yzy7');

// Add models for order creation
const ShoppingCart = require('../models/ShoppingCart');
const Order = require('../models/Order');
const OrderDetails = require('../models/OrderDetails');
const Product = require('../models/Product');

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
  const { user_id, address } = req.body;
  if (!user_id || !address) {
    return res.status(400).json({ error: 'user_id and address are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get user's cart
    const cart = await ShoppingCart.getCartByUserId(user_id, client);
    if (!cart) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No cart found for user' });
    }

    // 2. Get cart items
    const items = await ShoppingCart.getItems(cart.id, client);
    if (!items.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 3. Decrement stock first (atomic per product)
    for (const item of items) {
      const qty = Number(item.quantity);
      try {
        await Product.decrementStock(item.product_id, qty, client);
      } catch (err) {
        if (err && err.code === 'INSUFFICIENT_STOCK') {
          err.product_name = item.name;
        }
        throw err;
      }
    }

    // 4. Calculate total
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    // 5. Create order
    const order = await Order.createOrder({ user_id, total, address, status: 'paid' }, client);

    // 6. Copy items to order_details
    for (const item of items) {
      await OrderDetails.createOrderDetail({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }, client);
    }

    // 7. Clear cart
    await ShoppingCart.clearCart(cart.id, client);

    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }

    if (err && err.code === 'INSUFFICIENT_STOCK') {
      const details = {
        product_id: err.product_id,
        product_name: err.product_name,
        requested: err.requested,
      };
      return res.status(409).json({ error: 'Insufficient stock for one or more items', details });
    }
    if (err && err.code === 'INVALID_QUANTITY') {
      return res.status(400).json({ error: err.message });
    }

    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
