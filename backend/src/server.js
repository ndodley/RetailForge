console.log('🔥 Server is starting... Logging should work!');

const express = require('express');
const session = require('express-session'); // Add Session
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db'); // Use your existing pool

const app = express();
console.log('app'); // ✅ Debugging Check

// Define directories
const productImagesDir = path.join(__dirname, '../images/product_images');
const defaultImagePath = '/images/other_images/dummy_product.jpg';

console.log('server __dirname:', __dirname); // ✅ Debugging Check
console.log('productImagesDir:', productImagesDir); // ✅ Debugging Check
console.log('defaultImagePath:', defaultImagePath); // ✅ Debugging Check

// Ensure directories exist
if (!fs.existsSync(productImagesDir)) {
    fs.mkdirSync(productImagesDir, { recursive: true });
}

// Configure Multer storage globally
const storage = multer.diskStorage({
    destination: productImagesDir,
    filename: (req, file, cb) => {
        cb(null, `product_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });
//console.log('upload:', upload); // ✅ Debugging Check


// Now that Multer is initialized, we can export it properly
module.exports.upload = upload; // ✅ Separate export ensures Multer is properly available
module.exports.app = express();


// Middleware
app.use(cors({
    origin: 'http://localhost:5173',  // ✅ Ensures frontend can access sessions
    credentials: true                 // ✅ Allows cookies to be sent
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Enable persistent session storage using connect-pg-simple
app.use(session({
    store: new pgSession({
        pool: pool,                // Use your existing PostgreSQL pool
        tableName: 'session'       // Default table name for sessions
    }),
    secret: 'your_secret_key',        // ✅ Change to a secure key
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,               // ✅ Prevents XSS attacks
        secure: false,                // ✅ Set `true` in production with HTTPS
        sameSite: 'lax'               // ✅ Use 'lax' for local development (HTTP)
    }
}));


// Serve static files
app.use('/uploads', express.static(productImagesDir)); // ✅ Ensures image files are accessible
app.use('/images', express.static(path.join(__dirname, '../images'))); // ✅ Allows direct access
console.log('pathjoin images: ', path.join(__dirname, '../images')); // ✅ Debugging Check

// Image upload endpoint (handled separately from product creation)
app.post('/api/upload', upload.single('image'), (req, res) => {
    const imagePath = req.file ? `/images/product_images/${req.file.filename}` : defaultImagePath;
    res.json({ imagePath });
});


const departmentRoutes = require('./routes/departmentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const shoppingCartRoutes = require('./routes/shoppingCartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderDetailsRoutes = require('./routes/orderDetailsRoutes');

//console.log('departmentRoutes'); // ✅ Debugging Check
//console.log('categoryRoutes'); // ✅ Debugging Check
//console.log('productRoutes'); // ✅ Debugging Check


// Routes (must be placed BEFORE error handling)
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', shoppingCartRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api/order-details', orderDetailsRoutes);
app.use('/api/payment', paymentRoutes);



// ✅ Global Error Handling (prevents crashes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Set server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
