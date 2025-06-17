const User = require('../models/User');

// ✅ Register User (Authentication Logic Preserved)
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

// ✅ Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findUserByEmail(email);
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get session user (Matches `/api/auth/me` in frontend)
exports.handleAuthUser = async (req, res) => {
    try {
        const user = req.user; // Assuming session middleware attaches `user`
        if (!user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Logout user
exports.handleLogoutUser = async (req, res) => {
    res.clearCookie("session"); // ✅ Clears session cookie
    res.status(200).json({ message: 'Logged out successfully' });
};

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.updateUser(req.params.id, req.body);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete user
exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.deleteUser(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
