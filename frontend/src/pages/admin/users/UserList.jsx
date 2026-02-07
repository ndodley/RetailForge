import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserTable from "../../../components/tables/UserTable"; // ✅ Correct import path
import AdminLayout from "../../../components/admin/AdminLayout";
import AdvancedSearchPanel from "../../../components/common/AdvancedSearchPanel";

const UserList = () => {
    const navigate = useNavigate();
    const [roleFilter, setRoleFilter] = useState("All");
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filtersOpen, setFiltersOpen] = useState(false);

    return (
        <AdminLayout
            title="Manage Users"
            actions={(
                <button
                    className="admin-btn admin-btn--primary"
                    onClick={() => navigate("/admin/users/upsert")}
                >
                    Add New User
                </button>
            )}
        >
            <div style={{ maxWidth: 980 }}>
                <AdvancedSearchPanel
                    title="Advanced Search"
                    query={search}
                    onQueryChange={setSearch}
                    isOpen={filtersOpen}
                    onToggleOpen={() => setFiltersOpen((v) => !v)}
                    onSearch={() => setFiltersOpen(false)}
                    sections={[
                        {
                            key: 'sort',
                            title: 'Sort',
                            type: 'radio',
                            value: sortBy,
                            onChange: (v) => setSortBy(String(v)),
                            options: [
                                { value: 'best', label: 'Best Match' },
                                { value: 'last', label: 'Last Name' },
                                { value: 'first', label: 'First Name' },
                                { value: 'email', label: 'Email' },
                                { value: 'role', label: 'Role' },
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
                        {
                            key: 'role',
                            title: 'Role',
                            type: 'radio',
                            value: roleFilter,
                            onChange: (v) => setRoleFilter(String(v)),
                            options: [
                                { value: 'All', label: 'All' },
                                { value: 'Manager', label: 'Manager' },
                                { value: 'Employee', label: 'Employee' },
                                { value: 'Customer', label: 'Customer' },
                            ],
                        },
                    ]}
                />
            </div>

            <UserTable roleFilter={roleFilter} searchQuery={search} sortBy={sortBy} sortOrder={sortOrder} />
        </AdminLayout>
    );
};

export default UserList;
