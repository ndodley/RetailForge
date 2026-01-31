// The purpose of routes is to set up the endpoints for review-related operations.

const express = require('express');
const router = express.Router();
const {
  handleGetAllReviews,
  handleGetReviewById,
  handleCreateReview,
  handleGetReviewsByProduct,
  handleUpdateReview,
  handleDeleteReview
} = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get all reviews (admin)
router.get('/', handleGetAllReviews);

// Get a single review by id (admin)
router.get('/:id', handleGetReviewById);

// Get all reviews for a product
router.get('/product/:product_id', handleGetReviewsByProduct);

// Create a review (requires auth)
router.post('/', authMiddleware, handleCreateReview);

// Update a review (admin or owner)
router.put('/:id', handleUpdateReview);

// Delete a review (admin can delete any, user can delete own)
router.delete('/:id', handleDeleteReview);

module.exports = router;
