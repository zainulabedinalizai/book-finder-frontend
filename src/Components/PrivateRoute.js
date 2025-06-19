import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const roleRedirectMap = {
  1: "/PersonalProfilePatient",
  2: "/PersonalProfile",
  19: "/PersonalProfileDoc",
  24: "/PersonalProfilePharma",
  27: "/PersonalProfileSaTeam",
};

const PrivateRoute = ({ children, allowedRoles = [], deniedRoles = [] }) => {
  const { user, isAuthenticated, role } = useAuth(); // ✅ destructure from custom hook

  // User not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // User role is explicitly denied
  if (deniedRoles.includes(role)) {
    return <Navigate to={roleRedirectMap[role] || "/login"} replace />;
  }

  // Allowed roles: if not specified, allow all except denied
  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return children;
  }

  // Not in allowed list
  return <Navigate to={roleRedirectMap[role] || "/login"} replace />;
};

export default PrivateRoute;
