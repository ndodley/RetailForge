// ShoppingCart Model
const pool = require('../db');

const parsePositiveInt = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
    return n;
};

const createInsufficientStockError = ({ product_id, stock, requested }) => {
    const err = new Error('Insufficient stock');
    err.code = 'INSUFFICIENT_STOCK';
    err.product_id = product_id;
    err.stock = stock;
    err.requested = requested;
    return err;
};

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
    async getCartByUserId(user_id, db = pool) {
        const result = await db.query(
            'SELECT * FROM shopping_cart WHERE user_id = $1',
            [user_id]
        );
        return result.rows[0];
    },

    // Add item to cart
    async addItem(cart_id, product_id, quantity) {
        const qty = parsePositiveInt(quantity);
        if (!qty) {
            const err = new Error('quantity must be a positive integer');
            err.code = 'INVALID_QUANTITY';
            throw err;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const productRes = await client.query(
                'SELECT stock FROM products WHERE id = $1',
                [product_id]
            );
            if (productRes.rowCount === 0) {
                const err = new Error('Product not found');
                err.code = 'PRODUCT_NOT_FOUND';
                throw err;
            }

            const stock = Number(productRes.rows[0].stock ?? 0);
            const existingRes = await client.query(
                'SELECT quantity FROM shopping_cart_items WHERE cart_id = $1 AND product_id = $2',
                [cart_id, product_id]
            );
            const existingQty = Number(existingRes.rows[0]?.quantity ?? 0);
            const requestedTotal = existingQty + qty;

            if (!Number.isFinite(stock) || requestedTotal > stock) {
                throw createInsufficientStockError({ product_id, stock, requested: requestedTotal });
            }

            const result = await client.query(
                `INSERT INTO shopping_cart_items (cart_id, product_id, quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = shopping_cart_items.quantity + $3
                 RETURNING *`,
                [cart_id, product_id, qty]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // Get all items in a cart
    async getItems(cart_id, db = pool) {
        const result = await db.query(
            `SELECT sci.*, p.name, p.price, p.image_path, p.stock
             FROM shopping_cart_items sci
             JOIN products p ON sci.product_id = p.id
             WHERE sci.cart_id = $1`,
            [cart_id]
        );
        return result.rows;
    },

    // Update item quantity
    async updateItem(cart_id, product_id, quantity) {
        const qty = parsePositiveInt(quantity);
        if (!qty) {
            const err = new Error('quantity must be a positive integer');
            err.code = 'INVALID_QUANTITY';
            throw err;
        }

        const productRes = await pool.query('SELECT stock FROM products WHERE id = $1', [product_id]);
        if (productRes.rowCount === 0) {
            const err = new Error('Product not found');
            err.code = 'PRODUCT_NOT_FOUND';
            throw err;
        }

        const stock = Number(productRes.rows[0].stock ?? 0);
        if (!Number.isFinite(stock) || qty > stock) {
            throw createInsufficientStockError({ product_id, stock, requested: qty });
        }

        const result = await pool.query(
            `UPDATE shopping_cart_items SET quantity = $3 WHERE cart_id = $1 AND product_id = $2 RETURNING *`,
            [cart_id, product_id, qty]
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
    async clearCart(cart_id, db = pool) {
        await db.query('DELETE FROM shopping_cart_items WHERE cart_id = $1', [cart_id]);
        return true;
    }
};

module.exports = ShoppingCart;
