//console.log('\n 🚀 productRoutes.js is running!');

const express = require('express');
const router = express.Router();
const server = require('../server'); 
//console.log('Upload Middleware:', server.upload); // ✅ Debugging Check

const { 
    handleGetAllProducts, 
    handleGetProductById, 
    handleCreateProduct, 
    handleUpdateProduct, 
    handleDeleteProduct 
} = require('../controllers/productController');

// Define routes using correctly imported Multer middleware
// Public GET endpoints (no authentication required)
router.get('/', handleGetAllProducts);
router.get('/:id', handleGetProductById);

// Protected endpoints (add authentication middleware if needed for admin)
// Example: const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');
// router.post('/', authMiddleware, managerOnly, server.upload.single('image'), handleCreateProduct);
// router.put('/:id', authMiddleware, managerOnly, server.upload.single('image'), handleUpdateProduct);
// router.delete('/:id', authMiddleware, managerOnly, handleDeleteProduct);

// For now, keep them public for testing/demo:
router.post('/', server.upload.single('image'), handleCreateProduct);
router.put('/:id', server.upload.single('image'), handleUpdateProduct);
router.delete('/:id', handleDeleteProduct);

module.exports = router;
