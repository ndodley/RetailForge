const OrderDetails = require('../models/OrderDetails');

// Create a new order detail (item in an order)
const handleCreateOrderDetail = async (req, res) => {
    try {
        const { order_id, product_id, product_name, quantity, price } = req.body;
        if (!order_id || !product_id || !product_name || !quantity || !price) {
            return res.status(400).json({ error: 'order_id, product_id, product_name, quantity, and price are required' });
        }
        const orderDetail = await OrderDetails.createOrderDetail({ order_id, product_id, product_name, quantity, price });
        res.status(201).json(orderDetail);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all order details for a specific order
const handleGetOrderDetailsByOrderId = async (req, res) => {
    try {
        const details = await OrderDetails.getOrderDetailsByOrderId(req.params.order_id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all order details for a specific product
const handleGetOrderDetailsByProductId = async (req, res) => {
    try {
        const details = await OrderDetails.getOrderDetailsByProductId(req.params.product_id);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an order detail by its ID
const handleDeleteOrderDetail = async (req, res) => {
    try {
        await OrderDetails.deleteOrderDetail(req.params.id);
        res.json({ message: 'Order detail deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Export all controller handlers as an object
module.exports = {
    handleCreateOrderDetail,
    handleGetOrderDetailsByOrderId,
    handleGetOrderDetailsByProductId,
    handleDeleteOrderDetail,
};
