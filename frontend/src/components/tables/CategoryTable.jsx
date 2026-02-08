import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdvancedSearchPanel from '../common/AdvancedSearchPanel';
import { downloadCsv } from '../../utils/csv';
import { categoryCsv, mapToCsvRows } from '../../utils/adminCsvSchemas';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all'); // all | unassigned | <id>
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const navigate = useNavigate();

    // ✅ Fetch categories with department info
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const [categoriesRes, departmentsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/categories'),
                    axios.get('http://localhost:5000/api/departments'),
                ]);
                setCategories(categoriesRes.data);
                setDepartments(departmentsRes.data);
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

    const departmentOptions = useMemo(() => {
        const opts = [{ value: 'all', label: 'Any' }, { value: 'unassigned', label: 'Unassigned' }];
        const sorted = [...departments].sort((a, b) => String(a.name).localeCompare(String(b.name)));
        sorted.forEach((d) => opts.push({ value: String(d.id), label: d.name }));
        return opts;
    }, [departments]);

    const filterSections = useMemo(() => {
        return [
            {
                key: 'department',
                title: 'Department',
                type: 'radio',
                value: selectedDepartment,
                onChange: (v) => setSelectedDepartment(String(v)),
                options: departmentOptions,
            },
            {
                key: 'sort',
                title: 'Sort',
                type: 'radio',
                value: sortBy,
                onChange: (v) => setSortBy(String(v)),
                options: [
                    { value: 'best', label: 'Best Match' },
                    { value: 'alpha', label: 'Alphabet' },
                    { value: 'dept', label: 'Department' },
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
    }, [departmentOptions, selectedDepartment, sortBy, sortOrder]);

    const visibleCategories = useMemo(() => {
        let next = Array.isArray(categories) ? categories : [];

        if (selectedDepartment !== 'all') {
            if (selectedDepartment === 'unassigned') {
                next = next.filter((c) => !c.department_id);
            } else {
                next = next.filter((c) => Number(c.department_id) === Number(selectedDepartment));
            }
        }

        const q = String(search || '').trim().toLowerCase();
        if (q) {
            next = next.filter((c) => {
                const name = String(c.name || '').toLowerCase();
                const desc = String(c.description || '').toLowerCase();
                const dept = String(c.department_name || '').toLowerCase();
                return name.includes(q) || desc.includes(q) || dept.includes(q);
            });
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        next = [...next].sort((a, b) => {
            if (sortBy === 'alpha') return multiplier * String(a.name || '').localeCompare(String(b.name || ''));
            if (sortBy === 'dept') return multiplier * String(a.department_name || '').localeCompare(String(b.department_name || ''));
            return 0;
        });

        return next;
    }, [categories, search, selectedDepartment, sortBy, sortOrder]);

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button
                    type="button"
                    className="admin-btn admin-btn--sm"
                    onClick={() => downloadCsv({
                        rows: mapToCsvRows(categoryCsv, visibleCategories),
                        filename: categoryCsv.filename,
                        columns: categoryCsv.columns,
                    })}
                    disabled={visibleCategories.length === 0}
                    title={visibleCategories.length === 0 ? 'No data to export' : 'Download CSV'}
                >
                    Download CSV
                </button>
            </div>

            {visibleCategories.length > 0 ? (
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 220 }}>Name</th>
                                <th>Description</th>
                                <th style={{ width: 220 }}>Department</th>
                                <th style={{ width: 220 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleCategories.map((category) => (
                                <tr key={category.id}>
                                    <td style={{ fontWeight: 800 }}>{category.name}</td>
                                    <td style={{ color: 'var(--muted)' }}>{category.description || 'No description'}</td>
                                    <td style={{ fontWeight: 800 }}>{category.department_name || 'Unassigned'}</td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <button
                                                className="admin-btn admin-btn--sm"
                                                onClick={() => navigate(`/admin/categories/upsert/${category.id}`)}
                                            >
                                                <span className="admin-action-icon" aria-hidden="true">✎</span>
                                                Edit
                                            </button>
                                            <button
                                                className="admin-btn admin-btn--sm admin-btn--danger"
                                                onClick={() => handleDelete(category.id)}
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
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No categories found.</div>
            )}
        </div>
    );
};

export default CategoryTable;
