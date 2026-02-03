import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ element }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // On hard refresh, AuthContext needs a moment to hydrate session user.
    // Don't redirect to /login until we've finished that check.
    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Loading...
            </div>
        );
    }

    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
        // Pass the current location in state for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <div className="homepage-background">
            {element}
        </div>
    );
};

export default PrivateRoute;
