// OrderDetails model: Handles all database operations for order_details
const pool = require('../db');

// Create a new order detail (item in an order)
const createOrderDetail = async ({ order_id, product_id, product_name, quantity, price }) => {
    const result = await pool.query(
        `INSERT INTO order_details (order_id, product_id, product_name, quantity, price) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [order_id, product_id, product_name, quantity, price]
    );
    return result.rows[0];
};

// Get all order details for a specific order, including product image_path
const getOrderDetailsByOrderId = async (order_id) => {
    const result = await pool.query(
        `SELECT od.*, p.image_path
         FROM order_details od
         LEFT JOIN products p ON od.product_id = p.id
         WHERE od.order_id = $1
         ORDER BY od.id`,
        [order_id]
    );
    return result.rows;
};

// Get all order details for a specific product
const getOrderDetailsByProductId = async (product_id) => {
    const result = await pool.query(
        `SELECT * FROM order_details WHERE product_id = $1 ORDER BY id`,
        [product_id]
    );
    return result.rows;
};

// Delete an order detail by its ID
const deleteOrderDetail = async (id) => {
    await pool.query(`DELETE FROM order_details WHERE id = $1`, [id]);
};

// Export all model functions as an object
module.exports = {
    createOrderDetail,
    getOrderDetailsByOrderId,
    getOrderDetailsByProductId,
    deleteOrderDetail,
};
