const express = require('express');
const router = express.Router();
const { 
    handleGetAllCategories, 
    handleGetCategoryById, 
    handleCreateCategory, 
    handleUpdateCategory, 
    handleDeleteCategory,
    handleBulkCreateCategories
} = require('../controllers/categoryController'); // ✅ Correct Import

const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');

// Define routes with the correct handler names
router.get('/', handleGetAllCategories);
router.get('/:id', handleGetCategoryById);
router.post('/', handleCreateCategory);
router.post('/bulk', authMiddleware, managerOnly, handleBulkCreateCategories);
router.put('/:id', handleUpdateCategory);
router.delete('/:id', handleDeleteCategory);

module.exports = router;
