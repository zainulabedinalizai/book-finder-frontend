// PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { authService } from '../Context/authService';

const PrivateRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {  // Added parentheses to call the function
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;