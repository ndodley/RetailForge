const User = require('../models/User');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' }); // ✅ Return JSON error response
    }

    req.session.user = user; // ✅ Stores user in session
    console.log("User stored in session:", req.session.user); // ✅ Debugging session storage

    res.json({ message: 'Login successful', user }); // ✅ Ensure JSON response
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
};

exports.getUserSession = (req, res) => {
    console.log("Session Data on request:", req.session);  // ✅ Debugging session persistence

    if (req.session && req.session.user) {
        return res.json({ user: req.session.user });
    }
    
    return res.status(401).json({ error: 'User not logged in' }); // ✅ Return proper error message
};
