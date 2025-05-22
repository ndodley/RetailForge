const authMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

const managerOnly = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Access denied: Managers only' });
    }
    next();
};

module.exports = { authMiddleware, managerOnly };
