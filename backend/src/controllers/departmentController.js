const { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../models/Department');
const pool = require('../db');

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

const handleBulkCreateDepartments = async (req, res) => {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
        return res.status(400).json({ error: 'No rows provided.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let inserted = 0;
        for (const row of rows) {
            const name = String(row?.name ?? '').trim();
            if (!name) {
                return res.status(400).json({ error: 'Department name is required for all rows.' });
            }
            await client.query('INSERT INTO departments (name) VALUES ($1)', [name]);
            inserted += 1;
        }

        await client.query('COMMIT');
        return res.status(201).json({ inserted });
    } catch (error) {
        await client.query('ROLLBACK');
        return res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { handleGetAllDepartments, handleGetDepartmentById, handleCreateDepartment, handleUpdateDepartment, handleDeleteDepartment, handleBulkCreateDepartments };
