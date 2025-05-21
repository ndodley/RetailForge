const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../models/Category');

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

module.exports = { handleGetAllCategories, handleGetCategoryById, handleCreateCategory, handleUpdateCategory, handleDeleteCategory };
