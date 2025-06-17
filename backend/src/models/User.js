const pool = require('../db');

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
        const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        return result.rows[0];
    },


    // CRUD Operations
    async getAllUsers() {
        const result = await pool.query(`
            SELECT id, first_name, last_name, email, role, phone_number, address
            FROM users
        `);
        return result.rows;
    },

    async getUserById(id) {
        const result = await pool.query(`
            SELECT id, first_name, last_name, email, role, phone_number, address
            FROM users
            WHERE id = $1
        `, [id]);
        return result.rows[0];
    },

    async updateUser(id, { first_name, last_name, email, password, role, phone_number, address }) {
        const result = await pool.query(`
            UPDATE users
            SET first_name = $1, last_name = $2, email = $3, password = $4, role = $5, phone_number = $6, address = $7
            WHERE id = $8
            RETURNING id, first_name, last_name, email, role, phone_number, address
        `, [first_name, last_name, email, password, role, phone_number, address, id]);

        return result.rows[0];
    },

    async deleteUser(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        return result.rowCount > 0;
    }

};

module.exports = User;
