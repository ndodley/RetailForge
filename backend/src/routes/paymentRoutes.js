const express = require('express');
const Stripe = require('stripe');
const router = express.Router();
const pool = require('../db');

const { kafkaEnabled, kafkaTopics } = require('../kafka/config');
const { createEventEnvelope } = require('../kafka/eventEnvelope');

// Use your Stripe secret key (keep this safe!)
// Prefer STRIPE_SECRET_KEY from env; fallback keeps local dev working.
const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY ||
  'sk_test_51RbrrTQDAYM6vQvxJaJ3AwnXBn86Kq10IZ2byphL9UZndsN6joHyQ0xRbFNQamVU1d1HKtpD5KPtU1J2RS01pWXk00vBW7Yzy7'
);

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

  const lowStockThresholdRaw = Number(process.env.LOW_STOCK_THRESHOLD);
  const lowStockThreshold = Number.isFinite(lowStockThresholdRaw) ? lowStockThresholdRaw : 5;

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
    // Option 1 behavior: when stock hits 0, emit only out_of_stock (skip low_stock).
    const lowStockAlerts = [];
    const outOfStockAlerts = [];
    for (const item of items) {
      const qty = Number(item.quantity);
      try {
        const updated = await Product.decrementStock(item.product_id, qty, client);
        const newStock = Number(updated.stock);

        if (newStock === 0) {
          outOfStockAlerts.push({
            productId: updated.id,
            productName: item.name || item.product_name || null,
          });
        } else if (newStock <= lowStockThreshold) {
          lowStockAlerts.push({
            productId: updated.id,
            productName: item.name || item.product_name || null,
            newStock,
          });
        }
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

    // Kafka event publish (after commit so consumers never see rolled-back orders)
    if (kafkaEnabled()) {
      try {
        const topics = kafkaTopics();
        // Require dynamically so the API can run even if kafkajs isn't installed,
        // as long as Kafka is disabled.
        // eslint-disable-next-line global-require
        const { publishJson } = require('../kafka/producer');

        const createdEnvelope = createEventEnvelope('order.created', {
          orderId: order.id,
          userId: user_id,
          total,
          address,
          status: order.status,
          itemCount: items.length,
          source: 'checkout',
        });

        await publishJson({
          topic: topics.orders,
          key: String(order.id),
          value: createdEnvelope,
        });

        const envelope = createEventEnvelope('order.paid', {
          orderId: order.id,
          userId: user_id,
          total,
          address,
          itemCount: items.length,
        });

        await publishJson({
          topic: topics.orders,
          key: String(order.id),
          value: envelope,
        });

        // Inventory low-stock alerts (fan-out to inventory consumers)
        for (const alert of lowStockAlerts) {
          const inventoryEnvelope = createEventEnvelope('inventory.low_stock', {
            orderId: order.id,
            userId: user_id,
            productId: alert.productId,
            productName: alert.productName,
            newStock: alert.newStock,
            threshold: lowStockThreshold,
          });

          await publishJson({
            topic: topics.inventory,
            key: String(alert.productId),
            value: inventoryEnvelope,
          });
        }

        // Inventory out-of-stock alerts
        for (const alert of outOfStockAlerts) {
          const inventoryEnvelope = createEventEnvelope('inventory.out_of_stock', {
            orderId: order.id,
            userId: user_id,
            productId: alert.productId,
            productName: alert.productName,
            newStock: 0,
          });

          await publishJson({
            topic: topics.inventory,
            key: String(alert.productId),
            value: inventoryEnvelope,
          });
        }
      } catch (e) {
        console.warn('[kafka] failed to publish order.paid event:', e?.message || e);
      }
    }

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
