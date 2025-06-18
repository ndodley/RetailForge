// ShoppingCart Model
const pool = require('../db');

const ShoppingCart = {
    // Create a new cart for a user
    async createCart(user_id) {
        const result = await pool.query(
            'INSERT INTO shopping_cart (user_id) VALUES ($1) RETURNING *',
            [user_id]
        );
        return result.rows[0];
    },

    // Get cart by user id
    async getCartByUserId(user_id) {
        const result = await pool.query(
            'SELECT * FROM shopping_cart WHERE user_id = $1',
            [user_id]
        );
        return result.rows[0];
    },

    // Add item to cart
    async addItem(cart_id, product_id, quantity) {
        const result = await pool.query(
            `INSERT INTO shopping_cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = shopping_cart_items.quantity + $3
             RETURNING *`,
            [cart_id, product_id, quantity]
        );
        return result.rows[0];
    },

    // Get all items in a cart
    async getItems(cart_id) {
        const result = await pool.query(
            `SELECT sci.*, p.name, p.price, p.image_path
             FROM shopping_cart_items sci
             JOIN products p ON sci.product_id = p.id
             WHERE sci.cart_id = $1`,
            [cart_id]
        );
        return result.rows;
    },

    // Update item quantity
    async updateItem(cart_id, product_id, quantity) {
        const result = await pool.query(
            `UPDATE shopping_cart_items SET quantity = $3 WHERE cart_id = $1 AND product_id = $2 RETURNING *`,
            [cart_id, product_id, quantity]
        );
        return result.rows[0];
    },

    // Remove item from cart
    async removeItem(cart_id, product_id) {
        await pool.query(
            'DELETE FROM shopping_cart_items WHERE cart_id = $1 AND product_id = $2',
            [cart_id, product_id]
        );
        return true;
    },

    // Clear cart
    async clearCart(cart_id) {
        await pool.query('DELETE FROM shopping_cart_items WHERE cart_id = $1', [cart_id]);
        return true;
    }
};

module.exports = ShoppingCart;
