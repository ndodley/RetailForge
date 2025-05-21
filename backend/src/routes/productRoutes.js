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
router.get('/', handleGetAllProducts);
router.get('/:id', handleGetProductById);
router.post('/', server.upload.single('image'), handleCreateProduct);
//console.log('createProduct route after:', handleCreateProduct); // ✅ Debugging Check
router.put('/:id', server.upload.single('image'), handleUpdateProduct); // ✅ Works now
router.delete('/:id', handleDeleteProduct);

module.exports = router;
