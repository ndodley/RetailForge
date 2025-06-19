const Order = require('../models/Order');

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

// Get all orders in the system
const handleGetAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the status of an order
const handleUpdateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'status is required' });
        await Order.updateOrderStatus(req.params.id, status);
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
    handleGetAllOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
};
