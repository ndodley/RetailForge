import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTable from "../../../components/tables/UserTable"; // ✅ Correct import path

const UserList = () => {
    const navigate = useNavigate();
    const [roleFilter, setRoleFilter] = useState("All");

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)',
            padding: 0,
        }}>
            <div>
                <h2>Manage Users</h2>
                <button onClick={() => navigate("/admin/users/upsert")}>Add New User</button>

                {/* ✅ Role-Based Dropdown Filter */}
                <div>
                    <label htmlFor="role-select">Filter by Role: </label>
                    <select 
                        id="role-select" 
                        value={roleFilter} 
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                        <option value="Customer">Customer</option>
                    </select>
                </div>

                {/* ✅ Pass selected roleFilter to UserTable */}
                <UserTable roleFilter={roleFilter} />
            </div>
        </div>
    );
};

export default UserList;
