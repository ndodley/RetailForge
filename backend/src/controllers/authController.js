const User = require('../models/User');
const bcrypt = require('bcryptjs');

function looksLikeBcryptHash(value) {
    return typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value);
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findUserByEmail(email);

    // Treat invalid credentials as a normal UI state (no noisy 401 in browser console).
    // The frontend should show a friendly message when user is null.
    if (!user) {
        return res.json({ user: null, error: 'Invalid credentials' });
    }

    const stored = user.password;

    // Support both bcrypt hashes (new) and plaintext passwords (legacy).
    let ok = false;
    if (looksLikeBcryptHash(stored)) {
        ok = await bcrypt.compare(String(password || ''), stored);
    } else {
        ok = String(stored || '') === String(password || '');
        // Auto-upgrade legacy plaintext password to bcrypt on successful login.
        if (ok) {
            const hashed = await bcrypt.hash(String(password || ''), 10);
            await User.updatePasswordById(user.id, hashed);
            user.password = hashed;
        }
    }

    if (!ok) {
        return res.json({ user: null, error: 'Invalid credentials' });
    }

    req.session.user_id = user.id; // ✅ Stores user id in session for auth
    // Optionally, you can also store the user object if you want:
    // req.session.user = user;
    console.log("User id stored in session:", req.session.user_id); // ✅ Debugging session storage

    // Never return password to the client
    // eslint-disable-next-line no-unused-vars
    const { password: _password, ...safeUser } = user;

    res.json({ message: 'Login successful', user: safeUser });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
};

exports.getUserSession = (req, res) => {
    // For session-check endpoints, it's often nicer for the frontend if "not logged in"
    // is represented as a 200 with { user: null } (instead of a noisy 401 in the console).
    if (!(req.session && req.session.user_id)) {
        return res.json({ user: null });
    }

    User.getUserById(req.session.user_id)
        .then((user) => res.json({ user: user || null }))
        .catch(() => res.json({ user: null }));
};
