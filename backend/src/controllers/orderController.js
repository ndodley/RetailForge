const Order = require('../models/Order');
const OrderDetails = require('../models/OrderDetails');
const { kafkaEnabled, kafkaTopics } = require('../kafka/config');
const { createEventEnvelope } = require('../kafka/eventEnvelope');

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];
const ORDER_STATUS_TRANSITIONS = {
    pending: new Set(['pending', 'paid', 'cancelled']),
    paid: new Set(['paid', 'shipped', 'cancelled']),
    shipped: new Set(['shipped']),
    cancelled: new Set(['cancelled']),
};

function normalizeStatus(value) {
    return String(value || '').trim().toLowerCase();
}

// Create a new order
const handleCreateOrder = async (req, res) => {
    try {
        // Validate required fields
        const { user_id, total, address, status } = req.body;
        if (!user_id || !total || !address) {
            return res.status(400).json({ error: 'user_id, total, and address are required' });
        }
        // Create the order using the model
        const order = await Order.createOrder({ user_id, total, address, status });

        // Kafka event publish (best-effort)
        if (kafkaEnabled()) {
            try {
                const topics = kafkaTopics();
                // eslint-disable-next-line global-require
                const { publishJson } = require('../kafka/producer');

                const envelope = createEventEnvelope('order.created', {
                    orderId: order.id,
                    userId: order.user_id,
                    total: order.total,
                    address: order.address,
                    status: order.status,
                    source: 'orders.create',
                });

                await publishJson({
                    topic: topics.orders,
                    key: String(order.id),
                    value: envelope,
                });
            } catch (e) {
                console.warn('[kafka] failed to publish order.created event:', e?.message || e);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single order by its ID
const handleGetOrderById = async (req, res) => {
    try {
        const order = await Order.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all orders for a specific user
const handleGetOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.getOrdersByUser(req.params.user_id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all orders for the currently signed-in user (from session)
const handleGetMyOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const orders = await Order.getOrdersByUser(userId);
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderDetails.getOrderDetailsByOrderId(order.id);
                return { ...order, items };
            })
        );

        res.json(ordersWithItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all orders in the system
const handleGetAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: get all orders with owning user's email
const handleGetAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await Order.getAllOrdersWithUserEmail();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: get a single order with user email and line items
const handleGetOrderAdminById = async (req, res) => {
    try {
        const order = await Order.getOrderByIdWithUserEmail(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const items = await OrderDetails.getOrderDetailsByOrderId(order.id);
        res.json({ ...order, items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the status of an order
const handleUpdateOrderStatus = async (req, res) => {
    try {
        const status = normalizeStatus(req.body?.status);
        if (!status) return res.status(400).json({ error: 'status is required' });
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                error: 'Invalid status value',
                allowedStatuses: ORDER_STATUSES,
            });
        }

        const existing = await Order.getOrderById(req.params.id);
        if (!existing) return res.status(404).json({ error: 'Order not found' });

        const oldStatus = normalizeStatus(existing.status);
        const allowedNext = ORDER_STATUS_TRANSITIONS[oldStatus];
        if (!allowedNext || !allowedNext.has(status)) {
            return res.status(400).json({
                error: `Invalid status transition: ${oldStatus} -> ${status}`,
                allowedNextStatuses: Array.from(allowedNext || []),
            });
        }

        await Order.updateOrderStatus(req.params.id, status);

        // Kafka event publish (best-effort)
        if (kafkaEnabled()) {
            try {
                const topics = kafkaTopics();
                // eslint-disable-next-line global-require
                const { publishJson } = require('../kafka/producer');

                const envelope = createEventEnvelope('order.status_updated', {
                    orderId: existing.id,
                    userId: existing.user_id,
                    oldStatus,
                    newStatus: status,
                    changedByUserId: req.user?.id || null,
                    source: 'orders.updateStatus',
                });

                await publishJson({
                    topic: topics.orders,
                    key: String(existing.id),
                    value: envelope,
                });
            } catch (e) {
                console.warn('[kafka] failed to publish order.status_updated event:', e?.message || e);
            }
        }

        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an order by its ID
const handleDeleteOrder = async (req, res) => {
    try {
        await Order.deleteOrder(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export all controller handlers as an object
module.exports = {
    handleCreateOrder,
    handleGetOrderById,
    handleGetOrdersByUser,
    handleGetMyOrders,
    handleGetAllOrders,
    handleGetAllOrdersAdmin,
    handleGetOrderAdminById,
    handleUpdateOrderStatus,
    handleDeleteOrder,
};
