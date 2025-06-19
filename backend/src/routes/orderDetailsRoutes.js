const express = require('express');
const {
    handleCreateOrderDetail,
    handleGetOrderDetailsByOrderId,
    handleGetOrderDetailsByProductId,
    handleDeleteOrderDetail,
} = require('../controllers/orderDetailsController');

const router = express.Router();

// Create a new order detail (item in an order)
router.post('/', handleCreateOrderDetail);
// Get all order details for a specific order
router.get('/order/:order_id', handleGetOrderDetailsByOrderId);
// Get all order details for a specific product
router.get('/product/:product_id', handleGetOrderDetailsByProductId);
// Delete an order detail by its ID
router.delete('/:id', handleDeleteOrderDetail);

// Export the router for use in server.js
module.exports = router;
