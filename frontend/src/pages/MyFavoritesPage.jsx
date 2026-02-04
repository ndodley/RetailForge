import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../context/FavoritesContext';

const MyFavoritesPage = () => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const { isFavorited, loading: favoritesLoading } = useFavorites();

    const [products, setProducts] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (pageLoading || favoritesLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading favorites...</div>;
    }

    const visibleProducts = products.filter((p) => isFavorited(p.id));

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)', padding: 0 }}>
            <div style={{ maxWidth: 1200, margin: '2.5rem auto', padding: '2rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h2 style={{ fontWeight: 900, margin: 0, color: '#ff9800' }}>My Favorites</h2>
                    <Link to="/products" style={{ color: '#2196f3', textDecoration: 'underline', fontWeight: 700 }}>
                        Browse products
                    </Link>
                </div>

                {error && (
                    <div style={{ background: '#ffecec', border: '1px solid #ffb3b3', color: '#b00020', padding: '12px 14px', borderRadius: 10, marginTop: 16 }}>
                        {error}
                    </div>
                )}

                {!error && visibleProducts.length === 0 && (
                    <div style={{ marginTop: 18, color: '#555' }}>
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
