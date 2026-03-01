const pool = require('../db');

const DEFAULT_IMAGE_PATH = '/images/other_images/dummy_product.jpg'; // ✅ Default image path

// ✅ Fetch all products with category name
const getAllProducts = async () => {
    const result = await pool.query(`
        SELECT 
            products.id, 
            products.name, 
            products.brand,
            products.rating,
            products.price, 
            products.description, 
            products.stock, 
            products.image_path, 
            products.category_id, 
            categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
    `);
    return result.rows;
};

// ✅ Fetch a single product with category reference
const getProductById = async (id) => {
    const result = await pool.query(`
        SELECT 
            products.id, 
            products.name, 
            products.brand,
            products.rating,
            products.price, 
            products.description, 
            products.stock, 
            products.image_path, 
            products.category_id, 
            categories.name AS category_name
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        WHERE products.id = $1
    `, [id]);
    return result.rows[0];
};

// ✅ Create a new product with category reference
const createProduct = async (name, brand, rating, price, description, stock, image_path, category_id) => {
    const imagePath = image_path || DEFAULT_IMAGE_PATH;
    
    const result = await pool.query(`
        INSERT INTO products (name, brand, rating, price, description, stock, image_path, category_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id
    `, [name, brand, rating, price, description, stock, imagePath, category_id]);

    return getProductById(result.rows[0].id); // ✅ Return full product with category reference
};

// ✅ Update an existing product with category reference
const updateProduct = async (id, name, brand, rating, price, description, stock, image_path, category_id) => {
    const result = await pool.query(`
        UPDATE products 
        SET name = $1, brand = $2, rating = $3, price = $4, description = $5, stock = $6, image_path = $7, category_id = $8 
        WHERE id = $9 
        RETURNING id
    `, [name, brand, rating, price, description, stock, image_path, category_id, id]);

    return getProductById(result.rows[0].id); // ✅ Return full product with category reference
};

// ✅ Delete a product
const deleteProduct = async (id) => {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
};

// ✅ Atomically decrement stock (fails if insufficient)
const decrementStock = async (product_id, quantity, db = pool) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
        const err = new Error('quantity must be a positive integer');
        err.code = 'INVALID_QUANTITY';
        throw err;
    }

    const result = await db.query(
        `UPDATE products
         SET stock = stock - $2
         WHERE id = $1 AND stock >= $2
         RETURNING id, stock`,
        [product_id, qty]
    );

    if (result.rowCount === 0) {
        const err = new Error('Insufficient stock');
        err.code = 'INSUFFICIENT_STOCK';
        err.product_id = product_id;
        err.requested = qty;
        throw err;
    }

    return result.rows[0];
};

module.exports = {  
    getAllProducts,  
    getProductById,  
    createProduct,  
    updateProduct,  
    deleteProduct,
    decrementStock
};
