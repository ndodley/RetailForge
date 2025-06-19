import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ element }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user || user.role !== 'manager') {
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
