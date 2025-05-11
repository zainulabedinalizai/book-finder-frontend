// AuthContext.js
import { createContext, useContext, useState } from 'react';
import { authService } from './authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (result.success && result.data) {
        const userData = result.data;
        localStorage.setItem('token', result.token || '');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userId', userData.UserId);
        localStorage.setItem('fullName', userData.FullName || userData.Username);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setError(result.message || 'Login failed');
      }
      return result;
    } catch (err) {
      setError("An error occurred during login");
      return { success: false, message: "An error occurred during login" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
