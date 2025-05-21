const express = require('express');
const router = express.Router();
const { 
    handleGetAllDepartments, 
    handleGetDepartmentById, 
    handleCreateDepartment, 
    handleUpdateDepartment, 
    handleDeleteDepartment 
} = require('../controllers/departmentController'); // ✅ Correct Import

// Define routes with the correct handler names
router.get('/', handleGetAllDepartments);
router.get('/:id', handleGetDepartmentById);
router.post('/', handleCreateDepartment);
router.put('/:id', handleUpdateDepartment);
router.delete('/:id', handleDeleteDepartment);

module.exports = router;
