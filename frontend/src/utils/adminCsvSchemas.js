export const departmentCsv = {
    filename: 'departments.csv',
    columns: [
        { key: 'name', label: 'name' },
    ],
    toRow: (d) => ({
        name: d?.name ?? '',
    }),
};

export const categoryCsv = {
    filename: 'categories.csv',
    columns: [
        { key: 'name', label: 'name' },
        { key: 'description', label: 'description' },
        { key: 'department_id', label: 'department_id' },
    ],
    toRow: (c) => ({
        name: c?.name ?? '',
        description: c?.description ?? '',
        department_id: c?.department_id ?? '',
    }),
};

export const productCsv = {
    filename: 'products.csv',
    columns: [
        { key: 'name', label: 'name' },
        { key: 'brand', label: 'brand' },
        { key: 'rating', label: 'rating' },
        { key: 'description', label: 'description' },
        { key: 'price', label: 'price' },
        { key: 'stock', label: 'stock' },
        { key: 'category_name', label: 'category_name' },
        { key: 'department_name', label: 'department_name' },
        { key: 'image_path', label: 'image_path' },
    ],
    toRow: (p) => ({
        name: p?.name ?? '',
        brand: p?.brand ?? '',
        rating: p?.rating ?? 0,
        description: p?.description ?? '',
        price: p?.price ?? '',
        stock: p?.stock ?? '',
        category_name: p?.category_name ?? '',
        department_name: p?.department_name ?? '',
        image_path: p?.image_path ?? '',
    }),
};

export const userCsv = {
    filename: 'users.csv',
    columns: [
        { key: 'first_name', label: 'first_name' },
        { key: 'last_name', label: 'last_name' },
        { key: 'email', label: 'email' },
        { key: 'password', label: 'password' },
        { key: 'role', label: 'role' },
        { key: 'phone_number', label: 'phone_number' },
        { key: 'address', label: 'address' },
    ],
    toRow: (u) => ({
        first_name: u?.first_name ?? '',
        last_name: u?.last_name ?? '',
        email: u?.email ?? '',
        password: '',
        role: u?.role ?? 'customer',
        phone_number: u?.phone_number ?? '',
        address: u?.address ?? '',
    }),
};

export const reviewCsv = {
    filename: 'reviews.csv',
    columns: [
        { key: 'product_id', label: 'product_id' },
        { key: 'user_id', label: 'user_id' },
        { key: 'rating', label: 'rating' },
        { key: 'comment', label: 'comment' },
    ],
    toRow: (r) => ({
        product_id: r?.product_id ?? '',
        user_id: r?.user_id ?? '',
        rating: r?.rating ?? '',
        comment: r?.comment ?? '',
    }),
};

export function mapToCsvRows(schema, data) {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((item) => schema.toRow(item));
}
