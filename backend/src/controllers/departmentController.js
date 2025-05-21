const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../models/Department');

const handleGetAllDepartments = async (req, res) => {
    try {
        const departments = await getAllDepartments();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleGetDepartmentById = async (req, res) => {
    try {
        const department = await getDepartmentById(req.params.id);
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleCreateDepartment = async (req, res) => {
    try {
        const department = await createDepartment(req.body.name);
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleUpdateDepartment = async (req, res) => {
    try {
        const department = await updateDepartment(req.params.id, req.body.name);
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const handleDeleteDepartment = async (req, res) => {
    try {
        const success = await deleteDepartment(req.params.id);
        res.json({ message: success ? 'Deleted successfully' : 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { handleGetAllDepartments, handleGetDepartmentById, handleCreateDepartment, handleUpdateDepartment, handleDeleteDepartment };
