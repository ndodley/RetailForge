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

// ✅ Get current signed-in user's profile
exports.getMyProfile = async (req, res) => {
    try {
        // authMiddleware ensures req.user exists
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Upload current signed-in user's avatar
exports.uploadMyAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No avatar file uploaded' });
        }

        const avatarPath = `/images/user_avatars/${req.file.filename}`;
        const updatedUser = await User.updateAvatarPath(req.user.id, avatarPath);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update current signed-in user's profile (editable fields only)
exports.updateMyProfile = async (req, res) => {
    try {
        const first_name = (req.body.first_name ?? req.user.first_name ?? '').trim();
        const last_name = (req.body.last_name ?? req.user.last_name ?? '').trim();
        const email = (req.body.email ?? req.user.email ?? '').trim();

        // Treat empty string as null for optional fields
        const phone_number_raw = (req.body.phone_number ?? req.user.phone_number ?? '');
        const phone_number = String(phone_number_raw).trim() || null;

        const address_raw = (req.body.address ?? req.user.address ?? '');
        const address = String(address_raw).trim() || null;

        if (!first_name || !last_name || !email) {
            return res.status(400).json({ error: 'First name, last name, and email are required.' });
        }

        const updatedUser = await User.updateMyProfile(req.user.id, {
            first_name,
            last_name,
            email,
            phone_number,
            address,
        });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        // Postgres unique violation
        if (error && error.code === '23505') {
            const msg = String(error.constraint || '').includes('users_email')
                ? 'Email is already in use.'
                : String(error.constraint || '').includes('users_phone_number')
                    ? 'Phone number is already in use.'
                    : 'Duplicate value.';

            return res.status(400).json({ error: msg });
        }

        res.status(500).json({ error: error.message });
    }
};
