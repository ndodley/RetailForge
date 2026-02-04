import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { user, loading: authLoading } = useAuth();

    const [favoriteIds, setFavoriteIds] = useState(() => new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const api = useMemo(() => {
        return axios.create({
            baseURL: 'http://localhost:5000/api',
            withCredentials: true,
        });
    }, []);

    const refreshFavoriteIds = async () => {
        if (!user) {
            setFavoriteIds(new Set());
            setLoading(false);
            return;
        }

        try {
            setError('');
            setLoading(true);
            const res = await api.get('/favorites/my/ids');
            const idsArray = Array.isArray(res.data?.ids) ? res.data.ids : [];
            setFavoriteIds(new Set(idsArray.map((id) => Number(id))));
        } catch (err) {
            const message = err?.response?.data?.error || 'Failed to load favorites.';
            setError(message);
            setFavoriteIds(new Set());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        refreshFavoriteIds();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    const isFavorited = (productId) => {
        return favoriteIds.has(Number(productId));
    };

    const toggleFavorite = async (productId) => {
        if (!user) {
            return { ok: false, error: 'Not signed in' };
        }

        const id = Number(productId);
        const currentlyFavorited = favoriteIds.has(id);

        // Optimistic UI
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (currentlyFavorited) next.delete(id);
            else next.add(id);
            return next;
        });

        try {
            const res = await api.post('/favorites/toggle', { product_id: id });
            const isFavoriteFromServer = Boolean(res.data?.is_favorite);
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (isFavoriteFromServer) next.add(id);
                else next.delete(id);
                return next;
            });
            return { ok: true, isFavorite: isFavoriteFromServer };
        } catch (err) {
            // Rollback
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (currentlyFavorited) next.add(id);
                else next.delete(id);
                return next;
            });
            const message = err?.response?.data?.error || 'Failed to update favorite.';
            return { ok: false, error: message };
        }
    };

    return (
        <FavoritesContext.Provider
            value={{
                favoriteIds,
                isFavorited,
                toggleFavorite,
                refreshFavoriteIds,
                loading,
                error,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const ctx = useContext(FavoritesContext);
    if (!ctx) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return ctx;
};
