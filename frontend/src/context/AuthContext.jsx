import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        console.log('[AuthContext] Initializing user state from localStorage:', storedUser);
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('[AuthContext] Error parsing stored user on initialization:', error);
    }
    return null;
  });
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('[AuthContext] verifySession check. Token:', token ? 'exists' : 'missing', 'Stored user:', storedUser ? 'exists' : 'missing');
      
      if (token && storedUser) {
        try {
          console.log('[AuthContext] Verifying token with backend /api/auth/me...');
          const { data } = await api.get('/api/auth/me');
          console.log('[AuthContext] Session verified successfully:', data.user);
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('[AuthContext] Session verification failed. Clearing storage.', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        console.log('[AuthContext] No token or stored user. Setting user to null.');
        setUser(null);
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('[AuthContext] Attempting login for email:', email);
      const { data } = await api.post('/api/auth/login', { email, password });
      
      console.log('[AuthContext] Login response data received:', data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Welcome back!');
      
      // Role based redirects
      const role = data.user.role;
      console.log('[AuthContext] Redirecting user with role:', role);
      if (role === 'super-admin' || role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'owner') {
        navigate('/owner-dashboard');
      } else if (role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        navigate('/');
      }
      
      return true;
    } catch (error) {
      console.error('[AuthContext] Login request failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Attempting logout...');
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout API error (continuing local cleanup):', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      console.log('[AuthContext] Local auth storage cleared. Redirecting to /login');
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const isSuperAdmin = user?.role === 'super-admin' || user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isOwner, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
