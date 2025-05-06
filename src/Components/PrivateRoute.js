import { Navigate } from 'react-router-dom';
import { authService } from '../Context/authService';

const PrivateRoute = ({ children }) => {
  if (!authService.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;