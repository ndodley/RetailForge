const authMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const managerOnly = (req, res, next) => {
    if (!req.user || (req.user.role !== 'manager' && req.user.role !== 'admin')) {
        return res.status(403).json({ error: 'Access denied: Admins/Managers only' });
    }
    next();
};

module.exports = { authMiddleware, managerOnly };
