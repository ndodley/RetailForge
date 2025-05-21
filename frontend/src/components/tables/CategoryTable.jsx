import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    // ✅ Fetch categories with department info
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('❌ Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // ✅ Handle delete without reloading
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/categories/${id}`);
            setCategories((prev) => prev.filter((category) => category.id !== id));
        } catch (error) {
            console.error('❌ Error deleting category:', error);
        }
    };

    return (
        <div>
            <h2>Category List</h2>
            {categories.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>{category.description || 'No description'}</td>
                                <td>{category.department_name || 'Unassigned'}</td> 
                                <td>
                                    <button onClick={() => navigate(`/admin/categories/upsert/${category.id}`)}>Edit</button>
                                    <button onClick={() => handleDelete(category.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No categories found.</p>
            )}
        </div>
    );
};

export default CategoryTable;
