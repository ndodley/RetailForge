const pool = require('../db');

const DEFAULT_IMAGE_PATH = '/images/other_images/dummy_product.jpg'; // ✅ Default image path

// ✅ Fetch all products with category name
const getAllProducts = async () => {
    const result = await pool.query(`
        SELECT 
            products.id, 
            products.name, 
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
const createProduct = async (name, price, description, stock, image_path, category_id) => {
    const imagePath = image_path || DEFAULT_IMAGE_PATH;
    
    const result = await pool.query(`
        INSERT INTO products (name, price, description, stock, image_path, category_id) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING id, name, price, description, stock, image_path, category_id
    `, [name, price, description, stock, imagePath, category_id]);

    return getProductById(result.rows[0].id); // ✅ Return full product with category reference
};

// ✅ Update an existing product with category reference
const updateProduct = async (id, name, price, description, stock, image_path, category_id) => {
    const result = await pool.query(`
        UPDATE products 
        SET name = $1, price = $2, description = $3, stock = $4, image_path = $5, category_id = $6 
        WHERE id = $7 
        RETURNING id, name, price, description, stock, image_path, category_id
    `, [name, price, description, stock, image_path, category_id, id]);

    return getProductById(result.rows[0].id); // ✅ Return full product with category reference
};

// ✅ Delete a product
const deleteProduct = async (id) => {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
};

module.exports = {  
    getAllProducts,  
    getProductById,  
    createProduct,  
    updateProduct,  
    deleteProduct  
};
