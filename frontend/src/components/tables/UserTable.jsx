import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserTable = ({ roleFilter }) => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/users");
                setUsers(response.data);
            } catch (error) {
                console.error("❌ Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/users/${id}`);
            setUsers((prev) => prev.filter((user) => user.id !== id));
        } catch (error) {
            console.error("❌ Error deleting user:", error);
        }
    };

    // ✅ Filter users based on selected role
    const filteredUsers = users.filter(user => roleFilter === "All" || user.role === roleFilter.toLowerCase());

    return (
        <div>
            <h2>User List</h2>
            {filteredUsers.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{`${user.first_name}`}</td>
                                <td>{`${user.last_name}`}</td>
                                <td>{user.email}</td>
                                <td>{user.phone_number || "N/A"}</td>
                                <td>{user.address || "N/A"}</td>
                                <td>
                                    <button onClick={() => navigate(`/admin/users/upsert/${user.id}`)}>Edit</button>
                                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
};

export default UserTable;
