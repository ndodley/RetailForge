const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../models/Category');
const pool = require('../db');

const handleGetAllCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleGetCategoryById = async (req, res) => {
    try {
        const category = await getCategoryById(req.params.id);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleCreateCategory = async (req, res) => {
    try {
        const category = await createCategory(req.body.name, req.body.description, req.body.department_id);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleUpdateCategory = async (req, res) => {
    try {
        const category = await updateCategory(req.params.id, req.body.name, req.body.description, req.body.department_id);
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleDeleteCategory = async (req, res) => {
    try {
        const success = await deleteCategory(req.params.id);
        res.json({ message: success ? 'Deleted successfully' : 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleBulkCreateCategories = async (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
        return res.status(400).json({ error: 'No rows provided.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let inserted = 0;
        for (const row of rows) {
            const name = String(row?.name ?? '').trim();
            const description = String(row?.description ?? '').trim();
            const department_id = Number(String(row?.department_id ?? '').trim());

            if (!name || !description || !Number.isFinite(department_id)) {
                return res.status(400).json({ error: 'Each category row requires name, description, and department_id.' });
            }

            await client.query(
                'INSERT INTO categories (name, description, department_id) VALUES ($1, $2, $3)',
                [name, description, department_id]
            );
            inserted += 1;
        }

        await client.query('COMMIT');
        return res.status(201).json({ inserted });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { handleGetAllCategories, handleGetCategoryById, handleCreateCategory, handleUpdateCategory, handleDeleteCategory, handleBulkCreateCategories };
