const pool = require('../db');

const User = {
    async createUser({ first_name, last_name, email, password, role = 'customer', phone_number, address }) {
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password, role, phone_number, address)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [first_name, last_name, email, password, role, phone_number, address]
        );
        return result.rows[0];
    },

    async findUserByEmail(email) {
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0];
    }
};

module.exports = User;
