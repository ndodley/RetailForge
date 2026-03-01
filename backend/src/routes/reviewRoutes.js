// The purpose of routes is to set up the endpoints for review-related operations.

const express = require('express');
const router = express.Router();
const {
  handleGetAllReviews,
  handleGetReviewById,
  handleCreateReview,
  handleGetReviewsByProduct,
  handleUpdateReview,
  handleDeleteReview,
  handleGetMyReviews,
  handleUpdateMyReview,
  handleDeleteMyReview,
  handleBulkCreateReviews
} = require('../controllers/reviewController');
const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');

// Get all reviews (admin)
router.get('/', handleGetAllReviews);

// Current user's reviews
router.get('/my', authMiddleware, handleGetMyReviews);
router.put('/my/:id', authMiddleware, handleUpdateMyReview);
router.delete('/my/:id', authMiddleware, handleDeleteMyReview);

// Get all reviews for a product
router.get('/product/:product_id', handleGetReviewsByProduct);

// Get a single review by id (admin)
router.get('/:id', handleGetReviewById);

// Create a review (requires auth)
router.post('/', authMiddleware, handleCreateReview);

// Bulk create reviews (admin/manager)
router.post('/bulk', authMiddleware, managerOnly, handleBulkCreateReviews);

// Update a review (admin or owner)
router.put('/:id', handleUpdateReview);

// Delete a review (admin can delete any, user can delete own)
router.delete('/:id', handleDeleteReview);

module.exports = router;
