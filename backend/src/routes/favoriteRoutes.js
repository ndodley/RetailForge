const express = require('express');
const {
    getMyFavoriteIds,
    getMyFavorites,
    toggleFavorite,
    addFavorite,
    removeFavorite,
} = require('../controllers/favoriteController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Current user favorites
router.get('/my/ids', authMiddleware, getMyFavoriteIds);
router.get('/my', authMiddleware, getMyFavorites);

// Mutations
router.post('/toggle', authMiddleware, toggleFavorite);
router.post('/', authMiddleware, addFavorite);
router.delete('/:productId', authMiddleware, removeFavorite);

module.exports = router;
