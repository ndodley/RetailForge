const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMyProfile,
    uploadMyAvatar,
    updateMyProfile,
    bulkCreateUsers,
} = require('../controllers/userController'); // ✅ Correct Import

const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Avatar upload config
const avatarsDir = path.join(__dirname, '../../images/user_avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination: avatarsDir,
    filename: (req, file, cb) => {
        cb(null, `avatar_${req.user?.id || 'user'}_${Date.now()}_${file.originalname}`);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Only image uploads are allowed'));
    }
});

// ✅ Authentication Routes (Keep them under `/api/auth/`)
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// Compatibility aliases used by the frontend
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Current signed-in user
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateMyProfile);
router.put('/me/avatar', authMiddleware, avatarUpload.single('avatar'), uploadMyAvatar);

// ✅ User CRUD Operations (Matches frontend API calls)
router.get('/', getAllUsers);  // 🔥 Change this if it was `router.get('/users', getAllUsers)`
router.get('/:id', getUserById);
router.post('/', registerUser);
router.post('/bulk', authMiddleware, managerOnly, bulkCreateUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


module.exports = router;
