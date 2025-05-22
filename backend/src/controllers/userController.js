const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { first_name, last_name, email, password, role, phone_number, address } = req.body;
    try {
        // Check if email already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user
        const newUser = await User.createUser({ first_name, last_name, email, password, role, phone_number, address });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
