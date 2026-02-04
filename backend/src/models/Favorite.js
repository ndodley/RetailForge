const db = require('../db');

const getFavoriteProductIdsByUserId = async (user_id) => {
    const result = await db.query(
        `SELECT product_id
         FROM favorites
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [user_id]
    );

    return result.rows.map((r) => r.product_id);
};

const getFavoriteProductsByUserId = async (user_id) => {
    const result = await db.query(
        `SELECT
            p.*, 
            f.created_at AS favorited_at
         FROM favorites f
         JOIN products p ON p.id = f.product_id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [user_id]
    );

    return result.rows;
};

const addFavorite = async (user_id, product_id) => {
    const result = await db.query(
        `INSERT INTO favorites (user_id, product_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, product_id) DO NOTHING
         RETURNING *`,
        [user_id, product_id]
    );

    return result.rows[0] || null;
};

const removeFavorite = async (user_id, product_id) => {
    const result = await db.query(
        `DELETE FROM favorites
         WHERE user_id = $1 AND product_id = $2
         RETURNING *`,
        [user_id, product_id]
    );

    return result.rows[0] || null;
};

const isFavorite = async (user_id, product_id) => {
    const result = await db.query(
        `SELECT 1
         FROM favorites
         WHERE user_id = $1 AND product_id = $2`,
        [user_id, product_id]
    );

    return result.rowCount > 0;
};

module.exports = {
    getFavoriteProductIdsByUserId,
    getFavoriteProductsByUserId,
    addFavorite,
    removeFavorite,
    isFavorite,
};
