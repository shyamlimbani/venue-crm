import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import LoadingSpinner from './components/ui/LoadingSpinner';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="module/:moduleId" element={<ModulePage />} />
        <Route path="customers" element={<Customers />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  );
}
