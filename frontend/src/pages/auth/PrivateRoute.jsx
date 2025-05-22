import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = ({ element }) => {
    const { user } = useAuth();

    if (!user || user.role !== 'manager') {
        return <Navigate to="/login" />;
    }

    return element;
};

export default PrivateRoute;
