import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { downloadCsv } from '../../utils/csv';
import { userCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';
import { backendImageUrl } from '../../utils/images';

const UserTable = ({ roleFilter, searchQuery = '', sortBy = 'best', sortOrder = 'desc' }) => {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const pageSize = 6;

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

    const sortedUsers = useMemo(() => {
        const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
            if (roleFilter !== "All" && user.role !== String(roleFilter).toLowerCase()) return false;

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
    }, [roleFilter, searchQuery, sortBy, sortOrder, users]);

    useEffect(() => {
        setPage(1);
    }, [sortedUsers.length]);

    const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedUsers = sortedUsers.slice((safePage - 1) * pageSize, safePage * pageSize);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '14px 0 10px' }}>
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
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, sortedUsers.length)} of {sortedUsers.length}
                        </div>
                        <div className="admin-pagination-controls">
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                title={safePage <= 1 ? 'Already on first page' : 'Previous page'}
                            >
                                Prev
                            </button>
                            <div className="admin-pagination-meta">Page {safePage} / {totalPages}</div>
                            <button
                                type="button"
                                className="admin-btn admin-btn--sm"
                                disabled={safePage >= totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                title={safePage >= totalPages ? 'Already on last page' : 'Next page'}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="admin-grid">
                        {pagedUsers.map((user) => (
                            <div key={user.id} className="admin-grid-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                        <img
                                            src={backendImageUrl(user.avatar_path)}
                                            alt=""
                                            width={38}
                                            height={38}
                                            style={{ objectFit: 'cover', borderRadius: 999 }}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = backendImageUrl('');
                                            }}
                                        />
                                        <div className="admin-grid-title" style={{ overflowWrap: 'anywhere', minWidth: 0 }}>
                                            {String(user.first_name || '')} {String(user.last_name || '')}
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-grid-meta">Email: {user.email}</div>
                                <div className="admin-grid-meta">Role: {user.role || '—'}</div>
                                <div className="admin-grid-meta">Phone: {user.phone_number || 'N/A'}</div>
                                <div className="admin-grid-meta" style={{ overflowWrap: 'anywhere' }}>Address: {user.address || 'N/A'}</div>

                                <div className="admin-grid-actions admin-row-actions">
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm"
                                        onClick={() => navigate(`/admin/users/upsert/${user.id}`)}
                                    >
                                        <span className="admin-action-icon" aria-hidden="true">✎</span>
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <span className="admin-action-icon" aria-hidden="true">✕</span>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No users found.</div>
            )}
        </div>
    );
};

export default UserTable;
