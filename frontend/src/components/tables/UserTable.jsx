import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { downloadCsv } from '../../utils/csv';
import { userCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';

const UserTable = ({ roleFilter, searchQuery = '', sortBy = 'best', sortOrder = 'desc' }) => {
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

    const filteredUsers = users.filter((user) => {
        if (roleFilter !== "All" && user.role !== roleFilter.toLowerCase()) return false;

        const q = String(searchQuery || '').trim().toLowerCase();
        if (!q) return true;

        const firstName = String(user.first_name || '').toLowerCase();
        const lastName = String(user.last_name || '').toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const phone = String(user.phone_number || '').toLowerCase();

        return (
            firstName.includes(q) ||
            lastName.includes(q) ||
            email.includes(q) ||
            phone.includes(q)
        );
    });

    const sortedUsers = (() => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        const next = [...filteredUsers];

        next.sort((a, b) => {
            if (sortBy === 'first') return multiplier * String(a.first_name || '').localeCompare(String(b.first_name || ''));
            if (sortBy === 'last') return multiplier * String(a.last_name || '').localeCompare(String(b.last_name || ''));
            if (sortBy === 'email') return multiplier * String(a.email || '').localeCompare(String(b.email || ''));
            if (sortBy === 'role') return multiplier * String(a.role || '').localeCompare(String(b.role || ''));
            return 0;
        });

        return next;
    })();

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => downloadCsv({
                        rows: mapToCsvRows(userCsv, sortedUsers),
                        filename: userCsv.filename,
                        columns: userCsv.columns,
                    })}
                    disabled={sortedUsers.length === 0}
                    title={sortedUsers.length === 0 ? 'No data to export' : 'Download CSV'}
                >
                    Download CSV
                </button>
            </div>
            {sortedUsers.length > 0 ? (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 180 }}>First Name</th>
                                <th style={{ width: 180 }}>Last Name</th>
                                <th>Email</th>
                                <th style={{ width: 180 }}>Phone</th>
                                <th style={{ width: 280 }}>Address</th>
                                <th style={{ width: 220 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user) => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 800 }}>{`${user.first_name}`}</td>
                                    <td style={{ fontWeight: 800 }}>{`${user.last_name}`}</td>
                                    <td style={{ fontWeight: 700 }}>{user.email}</td>
                                    <td style={{ color: 'var(--muted)' }}>{user.phone_number || "N/A"}</td>
                                    <td style={{ color: 'var(--muted)' }}>{user.address || "N/A"}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button className="admin-btn admin-btn--sm" onClick={() => navigate(`/admin/users/upsert/${user.id}`)}>
                                                <span className="admin-action-icon" aria-hidden="true">✎</span>
                                                Edit
                                            </button>
                                            <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => handleDelete(user.id)}>
                                                <span className="admin-action-icon" aria-hidden="true">✕</span>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No users found.</div>
            )}
        </div>
    );
};

export default UserTable;
