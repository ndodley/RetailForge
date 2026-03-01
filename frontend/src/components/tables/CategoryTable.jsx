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
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const pageSize = 6;

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

    useEffect(() => {
        setPage(1);
    }, [visibleCategories.length]);

    const totalPages = Math.max(1, Math.ceil(visibleCategories.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pagedCategories = visibleCategories.slice((safePage - 1) * pageSize, safePage * pageSize);

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

            <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '12px 0 10px' }}>
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
                <>
                    <div className="admin-pagination">
                        <div className="admin-pagination-meta">
                            Showing {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, visibleCategories.length)} of {visibleCategories.length}
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
                        {pagedCategories.map((category) => (
                            <div key={category.id} className="admin-grid-card">
                                <div className="admin-grid-title">{category.name}</div>
                                <div className="admin-grid-meta">Department: {category.department_name || 'Unassigned'}</div>
                                <div className="admin-grid-meta" style={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                                    {category.description || 'No description'}
                                </div>
                                <div className="admin-grid-actions admin-row-actions">
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm"
                                        onClick={() => navigate(`/admin/categories/upsert/${category.id}`)}
                                    >
                                        <span className="admin-action-icon" aria-hidden="true">✎</span>
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                        onClick={() => handleDelete(category.id)}
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
                <div style={{ padding: '6px 0', color: 'var(--muted)', fontWeight: 700 }}>No categories found.</div>
            )}
        </div>
    );
};

export default CategoryTable;
