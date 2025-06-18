import React from 'react';

const ProductSearchBar = ({
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedDepartment,
    setSelectedDepartment,
    categories,
    departments
}) => {
    // Only show categories that belong to the selected department
    const filteredCategories = selectedDepartment === 'all'
        ? []
        : categories.filter(cat => cat.department_id === parseInt(selectedDepartment));

    return (
        <div className="product-filters" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc', minWidth: 200 }}
            />
            
            <select
                value={selectedDepartment}
                onChange={e => {
                    setSelectedDepartment(e.target.value);
                    setSelectedCategory('all'); // Reset category when department changes
                }}
                style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc' }}
            >
                <option value="all">All Departments</option>
                {departments.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
            </select>

            {selectedDepartment !== 'all' && (
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ padding: '0.5rem 1rem', borderRadius: 4, border: '1px solid #ccc' }}
                >
                    <option value="all">All Categories</option>
                    {filteredCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            )}
            
        </div>
    );
};

export default ProductSearchBar;
