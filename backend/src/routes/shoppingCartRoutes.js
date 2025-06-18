const express = require('express');
const router = express.Router();
const cartController = require('../controllers/shoppingCartController');

// Get or create cart for user
router.get('/user/:userId', cartController.getOrCreateCart);

// Get all items in a cart
router.get('/:cartId/items', cartController.getCartItems);

// Add item to cart
router.post('/item', cartController.addItem);

// Update item quantity
router.put('/item', cartController.updateItem);

// Remove item from cart
router.delete('/item', cartController.removeItem);

// Clear cart
router.post('/clear', cartController.clearCart);

module.exports = router;
