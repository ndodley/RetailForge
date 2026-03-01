const DEFAULT_AVATAR_PATH = '/images/other_images/default_avatar.jpg';

const updateReview = async (id, { product_id, user_id, rating, comment }) => {
  const result = await db.query(
    `UPDATE reviews SET product_id = $1, user_id = $2, rating = $3, comment = $4 WHERE id = $5 RETURNING *`,
    [product_id, user_id, rating, comment, id]
  );
  return result.rows[0];
};

const db = require('../db');

const getAllReviews = async () => {
  const result = await db.query(
    `SELECT
        r.*,
        u.email AS username,
        u.id as user_id,
        COALESCE(NULLIF(u.avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path,
        p.name as product_name,
        p.image_path AS product_image_path
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN products p ON r.product_id = p.id
     ORDER BY r.created_at DESC`
  );
  return result.rows;
};

const createReview = async ({ product_id, user_id, rating, comment }) => {
  const result = await db.query(
    `INSERT INTO reviews (product_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [product_id, user_id, rating, comment]
  );
  return result.rows[0];
};

const getReviewsByProduct = async (product_id) => {
  const result = await db.query(
    `SELECT
        r.*,
        u.email AS username,
        u.id as user_id,
        COALESCE(NULLIF(u.avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE product_id = $1
     ORDER BY created_at DESC`,
    [product_id]
  );
  return result.rows;
};

const getReviewById = async (id) => {
  const result = await db.query(
    `SELECT
        r.*,
        u.email AS username,
        u.id as user_id,
        COALESCE(NULLIF(u.avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path,
        p.name as product_name,
        p.image_path AS product_image_path
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN products p ON r.product_id = p.id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0];
};

const deleteReview = async (id, user_id) => {
  // If user_id is null, allow delete any (admin); else only own review
  let result;
  if (user_id) {
    result = await db.query(
      `DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, user_id]
    );
  } else {
    result = await db.query(
      `DELETE FROM reviews WHERE id = $1 RETURNING *`,
      [id]
    );
  }
  return result.rows[0];
};

const getReviewsByUserId = async (user_id) => {
  const result = await db.query(
    `SELECT
        r.*, 
        p.name AS product_name,
        p.image_path AS product_image_path
     FROM reviews r
     JOIN products p ON r.product_id = p.id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC`,
    [user_id]
  );
  return result.rows;
};

const updateMyReview = async (id, user_id, { rating, comment }) => {
  const result = await db.query(
    `UPDATE reviews
     SET rating = $1, comment = $2
     WHERE id = $3 AND user_id = $4
     RETURNING *`,
    [rating, comment, id, user_id]
  );
  return result.rows[0];
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
  getReviewsByUserId,
  updateMyReview
};
