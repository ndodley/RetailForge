const express = require('express');
const {
    handleCreateOrder,
    handleGetOrderById,
    handleGetOrdersByUser,
    handleGetMyOrders,
    handleGetAllOrders,
    handleGetAllOrdersAdmin,
    handleGetOrderAdminById,
    handleUpdateOrderStatus,
    handleDeleteOrder,
} = require('../controllers/orderController');
const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new order
router.post('/', handleCreateOrder);

// Get all orders for the currently signed-in user
router.get('/my', authMiddleware, handleGetMyOrders);

// Admin: list all orders with user email
router.get('/admin', authMiddleware, managerOnly, handleGetAllOrdersAdmin);

// Admin: get one order with user email + items
router.get('/admin/:id', authMiddleware, managerOnly, handleGetOrderAdminById);

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
