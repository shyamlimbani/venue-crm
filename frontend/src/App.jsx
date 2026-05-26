import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import UsersPage from './pages/Users';
import Owners from './pages/Owners';
import OwnerDetails from './pages/OwnerDetails';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="admin-dashboard" element={<Dashboard />} />
        <Route path="owner-dashboard" element={<Dashboard />} />
        <Route path="staff-dashboard" element={<Dashboard />} />
        
        <Route path="module/:moduleId" element={<ModulePage />} />
        <Route path="customers" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><Customers /></ProtectedRoute>} />
        <Route path="payments" element={<ProtectedRoute allowedRoles={['admin']}><Payments /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><Reports /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><Notifications /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="owners" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><Owners /></ProtectedRoute>} />
        <Route path="owners/:id" element={<ProtectedRoute allowedRoles={['admin', 'owner']}><OwnerDetails /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
