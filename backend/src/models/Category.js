const pool = require('../db');

const getAllCategories = async () => {
    const result = await pool.query(`
        SELECT 
            categories.id, 
            categories.name, 
            categories.description, 
            categories.department_id, 
            departments.name AS department_name
        FROM categories
        LEFT JOIN departments ON categories.department_id = departments.id
    `);
    return result.rows;
};

const getCategoryById = async (id) => {
    const result = await pool.query(`
        SELECT 
            categories.id, 
            categories.name, 
            categories.description, 
            categories.department_id, 
            departments.name AS department_name
        FROM categories
        LEFT JOIN departments ON categories.department_id = departments.id
        WHERE categories.id = $1
    `, [id]);
    return result.rows[0];
};

const createCategory = async (name, description, department_id) => {
    const result = await pool.query(`
        INSERT INTO categories (name, description, department_id) 
        VALUES ($1, $2, $3) 
        RETURNING id, name, description, department_id
    `, [name, description, department_id]);

    return getCategoryById(result.rows[0].id); // ✅ Return full category with department reference
};

const updateCategory = async (id, name, description, department_id) => {
    const result = await pool.query(`
        UPDATE categories 
        SET name = $1, description = $2, department_id = $3 
        WHERE id = $4 
        RETURNING id, name, description, department_id
    `, [name, description, department_id, id]);

    return getCategoryById(result.rows[0].id); // ✅ Return full category with department reference
};

const deleteCategory = async (id) => {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    return result.rowCount > 0;
};

module.exports = {  
    getAllCategories,  
    getCategoryById,  
    createCategory,  
    updateCategory,  
    deleteCategory  
};
