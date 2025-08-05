const db = require('../db');

const Review = {
  async create({ product_id, user_id, rating, comment }) {
    const result = await db.query(
      `INSERT INTO reviews (product_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [product_id, user_id, rating, comment]
    );
    return result.rows[0];
  },

  async getByProduct(product_id) {
    const result = await db.query(
      `SELECT r.*, u.email AS username, u.id as user_id FROM reviews r JOIN users u ON r.user_id = u.id WHERE product_id = $1 ORDER BY created_at DESC`,
      [product_id]
    );
    return result.rows;
  },

  async delete(id, user_id) {
    // Only allow user to delete their own review
    const result = await db.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );
    return result.rows[0];
  }
};

module.exports = Review;
