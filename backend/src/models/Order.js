// Order model: Handles all database operations for orders
const pool = require('../db');

// Create a new order
const createOrder = async ({ user_id, total, address, status = 'pending' }) => {
    // Insert a new order and return the created row
    const result = await pool.query(
        `INSERT INTO orders (user_id, total, address, status) VALUES ($1, $2, $3, $4) RETURNING *`,
        [user_id, total, address, status]
    );
    return result.rows[0];
};

// Get a single order by its ID
const getOrderById = async (id) => {
    const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    return result.rows[0];
};

// Get all orders for a specific user
const getOrdersByUser = async (user_id) => {
    const result = await pool.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
    return result.rows;
};

// Get all orders in the system
const getAllOrders = async () => {
    const result = await pool.query(`SELECT * FROM orders ORDER BY created_at DESC`);
    return result.rows;
};

// Update the status (and timestamp) of an order
const updateOrderStatus = async (id, status) => {
    await pool.query(
        `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [status, id]
    );
};

// Delete an order by its ID
const deleteOrder = async (id) => {
    await pool.query(`DELETE FROM orders WHERE id = $1`, [id]);
};

// Export all model functions as an object
module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUser,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
};
