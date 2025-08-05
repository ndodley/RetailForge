const Review = require('../models/Review');

const reviewController = {
  async createReview(req, res) {
    try {
      const { product_id, rating, comment } = req.body;
      const user_id = req.user.id; // assumes auth middleware sets req.user
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be 1-5' });
      }
      const review = await Review.create({ product_id, user_id, rating, comment });
      res.status(201).json({ review });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getReviewsByProduct(req, res) {
    try {
      const { product_id } = req.params;
      const reviews = await Review.getByProduct(product_id);
      res.json({ reviews });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;
      const deleted = await Review.delete(id, user_id);
      if (!deleted) return res.status(403).json({ error: 'Not allowed' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = reviewController;
