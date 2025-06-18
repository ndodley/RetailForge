// ShoppingCart Controller
const ShoppingCart = require('../models/ShoppingCart');

// Get or create cart for user
exports.getOrCreateCart = async (req, res) => {
    // Accept userId from either req.params, req.query, or req.body
    const user_id = req.params.userId || req.query.user_id || req.body.user_id || req.user?.id;
    if (!user_id) return res.status(400).json({ error: 'User ID required' });
    let cart = await ShoppingCart.getCartByUserId(user_id);
    if (!cart) cart = await ShoppingCart.createCart(user_id);
    res.json(cart);
};

// Get all items in cart
exports.getCartItems = async (req, res) => {
    const cart_id = req.params.cartId;
    const items = await ShoppingCart.getItems(cart_id);
    res.json(items);
};

// Add item to cart
exports.addItem = async (req, res) => {
    const { cart_id, product_id, quantity } = req.body;
    if (!cart_id || !product_id || !quantity) return res.status(400).json({ error: 'Missing fields' });
    const item = await ShoppingCart.addItem(cart_id, product_id, quantity);
    res.json(item);
};

// Update item quantity
exports.updateItem = async (req, res) => {
    const { cart_id, product_id, quantity } = req.body;
    if (!cart_id || !product_id || !quantity) return res.status(400).json({ error: 'Missing fields' });
    const item = await ShoppingCart.updateItem(cart_id, product_id, quantity);
    res.json(item);
};

// Remove item from cart
exports.removeItem = async (req, res) => {
    const { cart_id, product_id } = req.body;
    if (!cart_id || !product_id) return res.status(400).json({ error: 'Missing fields' });
    await ShoppingCart.removeItem(cart_id, product_id);
    res.json({ success: true });
};

// Clear cart
exports.clearCart = async (req, res) => {
    const { cart_id } = req.body;
    if (!cart_id) return res.status(400).json({ error: 'Missing cart_id' });
    await ShoppingCart.clearCart(cart_id);
    res.json({ success: true });
};
