import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../common/AdvancedSearchPanel';

const DepartmentTable = () => {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filtersOpen, setFiltersOpen] = useState(false);
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

    const filterSections = useMemo(() => {
        return [
            {
                key: 'sort',
                title: 'Sort',
                type: 'radio',
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
                options: [
                    { value: 'best', label: 'Best Match' },
                    { value: 'alpha', label: 'Alphabet' },
                ],
            },
            {
                key: 'order',
                title: 'Order',
                type: 'radio',
                value: sortOrder,
                onChange: (v) => setSortOrder(String(v)),
                options: [
                    { value: 'asc', label: 'Ascending' },
                    { value: 'desc', label: 'Descending' },
                ],
            },
        ];
    }, [sortBy, sortOrder]);

    const visibleDepartments = useMemo(() => {
        let next = Array.isArray(departments) ? departments : [];

        const q = String(search || '').trim().toLowerCase();
        if (q) {
            next = next.filter((d) => String(d.name || '').toLowerCase().includes(q));
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        next = [...next].sort((a, b) => {
            if (sortBy === 'alpha') return multiplier * String(a.name || '').localeCompare(String(b.name || ''));
            return 0;
        });

        return next;
    }, [departments, search, sortBy, sortOrder]);

    return (
        <div>
            <div style={{ maxWidth: 980, marginBottom: 12 }}>
                <AdvancedSearchPanel
                    title="Advanced Search"
                    query={search}
                    onQueryChange={setSearch}
                    isOpen={filtersOpen}
                    onToggleOpen={() => setFiltersOpen((v) => !v)}
                    onSearch={() => setFiltersOpen(false)}
                    sections={filterSections}
                />
            </div>

            {visibleDepartments.length > 0 ? (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th style={{ width: 220 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleDepartments.map((department) => (
                                <tr key={department.id}>
                                    <td style={{ fontWeight: 800 }}>{department.name}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button
                                                className="admin-btn admin-btn--sm"
                                                onClick={() => navigate(`/admin/departments/upsert/${department.id}`)}
                                            >
                                                <span className="admin-action-icon" aria-hidden="true">✎</span>
                                                Edit
                                            </button>
                                            <button
                                                className="admin-btn admin-btn--sm admin-btn--danger"
                                                onClick={() => handleDelete(department.id)}
                                            >
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
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No departments found.</div>
            )}
        </div>
    );
};

export default DepartmentTable;
