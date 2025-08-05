const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all reviews for a product
router.get('/product/:product_id', reviewController.getReviewsByProduct);

// Create a review (requires auth)
router.post('/', authMiddleware, reviewController.createReview);

// Delete a review (requires auth)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
