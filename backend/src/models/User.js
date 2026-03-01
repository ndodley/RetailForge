const pool = require('../db');

const DEFAULT_AVATAR_PATH = '/images/other_images/default_avatar.jpg';

const User = {

    // Authentication
    async createUser({ first_name, last_name, email, password, role = 'customer', phone_number, address }) {
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role, phone_number, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [first_name, last_name, email, password, role, phone_number, address]
        );
        return result.rows[0];
    },

    // Authentication
    async findUserByEmail(email) {
        const result = await pool.query(
            `SELECT *, COALESCE(NULLIF(avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path
             FROM users
             WHERE email = $1`,
            [email]
        );
        return result.rows[0];
    },


    // CRUD Operations
    async getAllUsers() {
        const result = await pool.query(`
            SELECT id, first_name, last_name, email, role, phone_number, address,
                   COALESCE(NULLIF(avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path
            FROM users
        `);
        return result.rows;
    },

    async getUserById(id) {
        const result = await pool.query(`
            SELECT id, first_name, last_name, email, role, phone_number, address,
                   COALESCE(NULLIF(avatar_path, ''), '${DEFAULT_AVATAR_PATH}') AS avatar_path
            FROM users
            WHERE id = $1
        `, [id]);
        return result.rows[0];
    },

    async updateAvatarPath(id, avatar_path) {
        const result = await pool.query(`
            UPDATE users
            SET avatar_path = $1
            WHERE id = $2
            RETURNING id, first_name, last_name, email, role, phone_number, address, avatar_path
        `, [avatar_path, id]);

        return result.rows[0];
    },

    async updateMyProfile(id, { first_name, last_name, email, phone_number, address }) {
        const result = await pool.query(`
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                email = $3,
                phone_number = $4,
                address = $5
            WHERE id = $6
            RETURNING id, first_name, last_name, email, role, phone_number, address, avatar_path
        `, [first_name, last_name, email, phone_number, address, id]);

        return result.rows[0];
    },

    async updateUser(id, { first_name, last_name, email, password, role, phone_number, address }) {
        const result = await pool.query(`
            UPDATE users
            SET first_name = $1, last_name = $2, email = $3, password = $4, role = $5, phone_number = $6, address = $7
            WHERE id = $8
            RETURNING id, first_name, last_name, email, role, phone_number, address, avatar_path
        `, [first_name, last_name, email, password, role, phone_number, address, id]);

        return result.rows[0];
    },

    async updatePasswordById(id, password) {
        const result = await pool.query(
            `UPDATE users SET password = $1 WHERE id = $2 RETURNING id`,
            [password, id]
        );
        return result.rows[0];
    },

    async deleteUser(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rowCount > 0;
    }

};

module.exports = User;
