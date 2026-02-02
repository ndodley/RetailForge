const express = require('express');
const {
    handleCreateOrder,
    handleGetOrderById,
    handleGetOrdersByUser,
    handleGetMyOrders,
    handleGetAllOrders,
    handleUpdateOrderStatus,
    handleDeleteOrder,
} = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new order
router.post('/', handleCreateOrder);

// Get all orders for the currently signed-in user
router.get('/my', authMiddleware, handleGetMyOrders);

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
