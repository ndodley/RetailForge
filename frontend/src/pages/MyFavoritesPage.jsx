import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import AdvancedSearchPanel from '../components/common/AdvancedSearchPanel';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../context/FavoritesContext';

const MyFavoritesPage = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    useFavorites();

    const [products, setProducts] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('best');
    const [sortOrder, setSortOrder] = useState('asc');
    const [stockFilter, setStockFilter] = useState('any');
    const [filtersOpen, setFiltersOpen] = useState(false);

    const api = useMemo(() => {
        return axios.create({
            baseURL: 'http://localhost:5000/api',
            withCredentials: true,
        });
    }, []);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user) {
                setPageLoading(false);
                return;
            }

            try {
                setError('');
                const res = await api.get('/favorites/my');
                setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                const message = err?.response?.data?.error || 'Failed to load favorites.';
                setError(message);
            } finally {
                setPageLoading(false);
            }
        };

        if (!loading) {
            fetchFavorites();
        }
    }, [loading, user, api]);

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
                    { value: 'price', label: 'Price' },
                    { value: 'stock', label: 'Stock' },
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
                key: 'stock',
                title: 'In Stock',
                type: 'radio',
                value: stockFilter,
                onChange: (v) => setStockFilter(String(v)),
                options: [
                    { value: 'any', label: 'Any' },
                    { value: 'in', label: 'True' },
                    { value: 'out', label: 'False' },
                ],
            },
        ];
    }, [sortBy, sortOrder, stockFilter]);

    const visibleProducts = useMemo(() => {
        // `/favorites/my` already returns only the user's favorite products.
        // Do not re-filter via context ids; that can temporarily hide everything.
        let visible = Array.isArray(products) ? products : [];

        if (search.trim()) {
            visible = visible.filter((p) => String(p.name || '').toLowerCase().includes(search.toLowerCase()));
        }

        if (stockFilter === 'in') {
            visible = visible.filter((p) => Number(p.stock || 0) > 0);
        }
        if (stockFilter === 'out') {
            visible = visible.filter((p) => Number(p.stock || 0) <= 0);
        }

        const multiplier = sortOrder === 'asc' ? 1 : -1;
        visible = [...visible].sort((a, b) => {
            if (sortBy === 'alpha') return multiplier * String(a.name).localeCompare(String(b.name));
            if (sortBy === 'price') return multiplier * (Number(a.price || 0) - Number(b.price || 0));
            if (sortBy === 'stock') return multiplier * (Number(a.stock || 0) - Number(b.stock || 0));
            return 0;
        });

        return visible;
    }, [products, search, sortBy, sortOrder, stockFilter]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading favorites...</div>;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--app-bg)', padding: 0 }}>
            <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: 'var(--text)' }}>My Favorites</h2>
                    <Link to="/products" style={{ color: 'var(--link)', textDecoration: 'underline', fontWeight: 800 }}>
                        Browse products
                    </Link>
                </div>

                <div style={{ marginTop: 16 }}>
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

                {error && (
                    <div style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '12px 14px', borderRadius: 10, marginTop: 16, fontWeight: 800 }}>
                        {error}
                    </div>
                )}

                {!error && visibleProducts.length === 0 && (
                    <div style={{ marginTop: 18, color: 'var(--muted)', fontWeight: 700 }}>
                        You don’t have any favorites yet. Go to the products page and click the star on any item.
                    </div>
                )}

                {visibleProducts.length > 0 && (
                    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
                        {visibleProducts.map((p) => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyFavoritesPage;
