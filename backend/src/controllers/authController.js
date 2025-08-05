const User = require('../models/User');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' }); // ✅ Return JSON error response
    }

    req.session.user_id = user.id; // ✅ Stores user id in session for auth
    // Optionally, you can also store the user object if you want:
    // req.session.user = user;
    console.log("User id stored in session:", req.session.user_id); // ✅ Debugging session storage

    res.json({ message: 'Login successful', user }); // ✅ Ensure JSON response
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
};

exports.getUserSession = (req, res) => {
    console.log("Session Data on request:", req.session);  // ✅ Debugging session persistence

    if (req.session && req.session.user_id) {
        // Fetch user from DB for session check
        User.getUserById(req.session.user_id).then(user => {
            if (user) {
                return res.json({ user });
            } else {
                return res.status(401).json({ error: 'User not logged in' });
            }
        });
    } else {
        return res.status(401).json({ error: 'User not logged in' }); // ✅ Return proper error message
    }
};
