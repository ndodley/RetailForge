const express = require('express');
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController'); // ✅ Correct Import

const router = express.Router();

// ✅ Authentication Routes (Keep them under `/api/auth/`)
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// ✅ User CRUD Operations (Matches frontend API calls)
router.get('/', getAllUsers);  // 🔥 Change this if it was `router.get('/users', getAllUsers)`
router.get('/:id', getUserById);
router.post('/', registerUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


module.exports = router;
