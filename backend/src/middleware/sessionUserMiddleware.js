const User = require('../models/User');

// Middleware to set req.user from session user_id
async function sessionUserMiddleware(req, res, next) {
  if (req.session && req.session.user_id) {
    try {
      const user = await User.getUserById(req.session.user_id);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      // ignore error, just don't set req.user
    }
  }
  next();
}

module.exports = sessionUserMiddleware;
