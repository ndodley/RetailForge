const express = require('express');
const router = express.Router();
const { 
    handleGetAllCategories, 
    handleGetCategoryById, 
    handleCreateCategory, 
    handleUpdateCategory, 
    handleDeleteCategory 
} = require('../controllers/categoryController'); // ✅ Correct Import

// Define routes with the correct handler names
router.get('/', handleGetAllCategories);
router.get('/:id', handleGetCategoryById);
router.post('/', handleCreateCategory);
router.put('/:id', handleUpdateCategory);
router.delete('/:id', handleDeleteCategory);

module.exports = router;
