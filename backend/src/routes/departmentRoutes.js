const express = require('express');
const router = express.Router();
const { 
    handleGetAllDepartments, 
    handleGetDepartmentById, 
    handleCreateDepartment, 
    handleUpdateDepartment, 
    handleDeleteDepartment,
    handleBulkCreateDepartments
} = require('../controllers/departmentController'); // ✅ Correct Import

const { authMiddleware, managerOnly } = require('../middleware/authMiddleware');

// Define routes with the correct handler names
router.get('/', handleGetAllDepartments);
router.get('/:id', handleGetDepartmentById);
router.post('/', handleCreateDepartment);
router.post('/bulk', authMiddleware, managerOnly, handleBulkCreateDepartments);
router.put('/:id', handleUpdateDepartment);
router.delete('/:id', handleDeleteDepartment);

module.exports = router;
