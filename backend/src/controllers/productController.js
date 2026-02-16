const fs = require('fs');
const path = require('path');

const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} = require('../models/Product'); // ✅ Correct Import

const pool = require('../db');

const DEFAULT_IMAGE_PATH = '/images/other_images/dummy_product.jpg';

const PRODUCT_IMAGE_PREFIX = '/images/product_images/';
const productImagesDir = path.join(__dirname, '../../images/product_images');

function getLocalProductImageFilePath(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return null;
    if (imagePath === DEFAULT_IMAGE_PATH) return null;
    if (!imagePath.startsWith(PRODUCT_IMAGE_PREFIX)) return null;
    const filename = path.basename(imagePath);
    if (!filename) return null;
    return path.join(productImagesDir, filename);
}

function deleteFileIfExists(filePath) {
    if (!filePath) return;
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
        console.warn('⚠️ Failed to delete file:', filePath, err?.message || err);
    }
}

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
        const { name, brand, rating, price, description, stock, category_id } = req.body;

        // ✅ Validate required fields
        if (!name || !price || !description || stock === undefined || !category_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (String(name).length > 255) {
            return res.status(400).json({ error: 'Name must be 255 characters or fewer.' });
        }

        if (brand !== undefined && brand !== null && String(brand).length > 255) {
            return res.status(400).json({ error: 'Brand must be 255 characters or fewer.' });
        }

        // Description is TEXT in DB (see migration 012), but keep a reasonable guardrail.
        if (String(description).length > 20000) {
            return res.status(400).json({ error: 'Description is too long.' });
        }

        const ratingValue = rating === undefined || rating === null || rating === '' ? 0 : Number(rating);
        if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
            return res.status(400).json({ error: 'Rating must be between 0 and 5' });
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
        const product = await createProduct(name, brand || null, ratingValue, price, description, stock, imagePath, category_id);

        if (!product) {
            return res.status(500).json({ error: 'Failed to create product' });
        }

        res.json(product);
    } catch (error) {
        console.error('Error in handleCreateProduct:', error);

        // Postgres: string data right truncation (e.g., VARCHAR too long)
        if (error && error.code === '22001') {
            return res.status(400).json({ error: 'One or more fields are too long for the database.' });
        }

        res.status(500).json({ error: error?.message || 'Internal Server Error' });
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
        const { name, brand, rating, price, description, stock, category_id } = req.body;
        const newImagePath = req.file ? `/images/product_images/${req.file.filename}` : null;

        //console.log('File received:', req.file); // ✅ Debugging Check

        // ✅ Fetch existing product to get old image path
        const existingProduct = await getProductById(req.params.id);

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (name !== undefined && name !== null && String(name).length > 255) {
            return res.status(400).json({ error: 'Name must be 255 characters or fewer.' });
        }

        if (brand !== undefined && brand !== null && String(brand).length > 255) {
            return res.status(400).json({ error: 'Brand must be 255 characters or fewer.' });
        }

        if (description !== undefined && description !== null && String(description).length > 20000) {
            return res.status(400).json({ error: 'Description is too long.' });
        }

        const ratingValue = rating === undefined || rating === null || rating === '' ? (existingProduct.rating ?? 0) : Number(rating);
        if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
            return res.status(400).json({ error: 'Rating must be between 0 and 5' });
        }

        if (existingProduct) {
            const oldImageFilePath = getLocalProductImageFilePath(existingProduct.image_path);
            // ✅ Delete the old image file if a new image is uploaded
            if (newImagePath && oldImageFilePath) {
                deleteFileIfExists(oldImageFilePath);
            }
        }

        // ✅ Update product in database, keeping old image if no new image was uploaded
        const updatedProduct = await updateProduct(
            req.params.id,
            name,
            brand === '' ? null : (brand ?? existingProduct.brand ?? null),
            ratingValue,
            price,
            description,
            stock,
            newImagePath || existingProduct.image_path, // ✅ Keep old image if no new one
            category_id
        );

        res.json(updatedProduct);
    } catch (error) {
        console.error('❌ Error updating product:', error);

        if (error && error.code === '22001') {
            return res.status(400).json({ error: 'One or more fields are too long for the database.' });
        }

        res.status(500).json({ error: error?.message || 'Internal Server Error' });
    }

};

const handleDeleteProduct = async (req, res) => {
    try {
        const deleted = await deleteProduct(req.params.id);
        if (!deleted) {
            return res.json({ message: 'Not found' });
        }

        const imageFilePath = getLocalProductImageFilePath(deleted.image_path);
        deleteFileIfExists(imageFilePath);
        return res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleBulkCreateProducts = async (req, res) => {
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
            const brandRaw = String(row?.brand ?? '').trim();
            const brand = brandRaw ? brandRaw : null;
            const description = String(row?.description ?? '').trim();
            const price = Number(String(row?.price ?? '').trim());
            const stock = Number(String(row?.stock ?? '').trim());

            const categoryName = String(row?.category_name ?? '').trim();
            const departmentName = String(row?.department_name ?? '').trim();
            const categoryIdRaw = String(row?.category_id ?? '').trim(); // backward compatible
            const category_id_from_csv = categoryIdRaw === '' ? null : Number(categoryIdRaw);

            const ratingRaw = String(row?.rating ?? '').trim();
            const ratingValue = ratingRaw === '' ? 0 : Number(ratingRaw);

            if (!name || !description || !Number.isFinite(price) || !Number.isFinite(stock)) {
                return res.status(400).json({ error: 'Each product row requires name, description, price, and stock.' });
            }

            if (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
                return res.status(400).json({ error: 'Rating must be between 0 and 5.' });
            }

            const image_path_raw = String(row?.image_path ?? '').trim();
            const image_path = image_path_raw || DEFAULT_IMAGE_PATH;

            let category_id = null;
            if (Number.isFinite(category_id_from_csv)) {
                category_id = category_id_from_csv;
            } else {
                if (!categoryName) {
                    return res.status(400).json({ error: 'Each product row requires category_name (category_id is no longer used).' });
                }

                if (departmentName) {
                    const categoryRes = await client.query(
                        `SELECT c.id
                         FROM categories c
                         JOIN departments d ON c.department_id = d.id
                         WHERE LOWER(c.name) = LOWER($1) AND LOWER(d.name) = LOWER($2)
                         LIMIT 2`,
                        [categoryName, departmentName]
                    );

                    if (categoryRes.rowCount === 0) {
                        return res.status(400).json({ error: `No category found for category_name="${categoryName}" and department_name="${departmentName}".` });
                    }
                    if (categoryRes.rowCount > 1) {
                        return res.status(400).json({ error: `Multiple categories found for category_name="${categoryName}" and department_name="${departmentName}".` });
                    }
                    category_id = categoryRes.rows[0].id;
                } else {
                    const categoryRes = await client.query(
                        `SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 2`,
                        [categoryName]
                    );

                    if (categoryRes.rowCount === 0) {
                        return res.status(400).json({ error: `No category found for category_name="${categoryName}".` });
                    }
                    if (categoryRes.rowCount > 1) {
                        return res.status(400).json({ error: `Multiple categories found for category_name="${categoryName}". Add department_name to disambiguate.` });
                    }
                    category_id = categoryRes.rows[0].id;
                }
            }

            const result = await client.query(
                `INSERT INTO products (name, brand, rating, price, description, stock, image_path, category_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
                [name, brand, ratingValue, price, description, stock, image_path, category_id]
            );

            if (!result.rows?.[0]?.id) {
                return res.status(500).json({ error: 'Failed to create product.' });
            }

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

module.exports = { 
    handleGetAllProducts, 
    handleGetProductById, 
    handleCreateProduct, 
    handleUpdateProduct, 
    handleDeleteProduct 
    ,
    handleBulkCreateProducts
};
