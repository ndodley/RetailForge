import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DepartmentTable = () => {
    const [departments, setDepartments] = useState([]);
    const navigate = useNavigate();

    // ✅ Fetch department list from backend
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/departments');
                setDepartments(response.data);
            } catch (error) {
                console.error('❌ Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, []);

    // ✅ Handle delete without page reload
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/departments/${id}`);
            setDepartments((prev) => prev.filter((department) => department.id !== id));
        } catch (error) {
            console.error('❌ Error deleting department:', error);
        }
    };

    return (
        <div>
            <h2>Department List</h2>
            {departments.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department) => (
                            <tr key={department.id}>
                                <td>{department.id}</td>
                                <td>{department.name}</td>
                                <td>
                                    <button onClick={() => navigate(`/admin/departments/upsert/${department.id}`)}>Edit</button>
                                    <button onClick={() => handleDelete(department.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No departments found.</p>
            )}
        </div>
    );
};

export default DepartmentTable;
