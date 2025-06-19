const express = require('express');
const {
    handleCreateOrder,
    handleGetOrderById,
    handleGetOrdersByUser,
    handleGetAllOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

// Create a new order
router.post('/', handleCreateOrder);
// Get all orders for a user (must be before /:id)
router.get('/user/:user_id', handleGetOrdersByUser);
// Get order by id
router.get('/:id', handleGetOrderById);
// Get all orders
router.get('/', handleGetAllOrders);
// Update order status
router.put('/:id/status', handleUpdateOrderStatus);
// Delete order
router.delete('/:id', handleDeleteOrder);

// Export the router for use in server.js
module.exports = router;
