const fs = require('fs');
const path = require('path');

const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../models/Product'); // ✅ Correct Import

const DEFAULT_IMAGE_PATH = '/images/other_images/dummy_product.jpg';

const handleGetAllProducts = async (req, res) => {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleGetProductById = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleCreateProduct = async (req, res) => {
    console.log('✅ Incoming product data:', req.body);
    console.log('✅ Uploaded image:', req.file);

    try {
        const { name, price, description, stock, category_id } = req.body;

        // ✅ Validate required fields
        if (!name || !price || !description || stock === undefined || !category_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // ✅ Debugging: Log received file and request body
        console.log('Received request body:', req.body);
        console.log('File received:', req.file);

        // ✅ Handle undefined `req.file`
        /* if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }*/

        //const imagePath = `/images/product_images/${req.file.filename}`;
        const imagePath = req.file ? `/images/product_images/${req.file.filename}` : DEFAULT_IMAGE_PATH;


        // ✅ Create product in database
        const product = await createProduct(name, price, description, stock, imagePath, category_id);

        if (!product) {
            return res.status(500).json({ error: 'Failed to create product' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error in handleCreateProduct:', error);
        res.status(500).json({ error: error.message });
    }

};

const handleUpdateProduct = async (req, res) => {
    /*try {
        const { name, price, description, stock, category_id, image_path } = req.body;

        console.log('File received:', req.file); // ✅ Debugging Check
        
        const newImagePath = req.file ? `/images/product_images/${req.file.filename}` : image_path; 
        
        const product = await updateProduct(req.params.id, name, price, description, stock, newImagePath, category_id);
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }*/
    try {
        const { name, price, description, stock, category_id } = req.body;
        const newImagePath = req.file ? `/images/product_images/${req.file.filename}` : null;

        //console.log('File received:', req.file); // ✅ Debugging Check

        // ✅ Fetch existing product to get old image path
        const existingProduct = await getProductById(req.params.id);

        if (existingProduct) {
            const oldImagePath = path.join(__dirname, '../..', existingProduct.image_path);
            console.log('oldImagePath: ', oldImagePath);
            console.log('newImagePath: ', newImagePath)

            // ✅ Delete the old image file if a new image is uploaded
            if (newImagePath && fs.existsSync(oldImagePath) && oldImagePath !== path.join(__dirname, '../..', DEFAULT_IMAGE_PATH)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // ✅ Update product in database, keeping old image if no new image was uploaded
        const updatedProduct = await updateProduct(
            req.params.id,
            name,
            price,
            description,
            stock,
            newImagePath || existingProduct.image_path, // ✅ Keep old image if no new one
            category_id
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

const handleDeleteProduct = async (req, res) => {
    try {
        const success = await deleteProduct(req.params.id);
        res.json({ message: success ? 'Deleted successfully' : 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    handleGetAllProducts, 
    handleGetProductById, 
    handleCreateProduct, 
    handleUpdateProduct, 
    handleDeleteProduct 
};
