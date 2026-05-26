import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Optional: verify token in background
      api.get('/api/auth/me')
        .then(({ data }) => setUser(data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      toast.success('Welcome back!');
      
      // Role based redirects
      if (data.user.role === 'admin') navigate('/admin-dashboard');
      else if (data.user.role === 'owner') navigate('/owner-dashboard');
      else if (data.user.role === 'staff') navigate('/staff-dashboard');
      else navigate('/');
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const isSuperAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isOwner, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
