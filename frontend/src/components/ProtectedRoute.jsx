import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  console.log('[ProtectedRoute] Evaluation:', {
    path: location.pathname,
    loadingState: loading,
    userState: user,
    tokenInStorage: !!token,
    userInStorage: !!storedUser
  });

  if (loading) {
    console.log('[ProtectedRoute] Currently loading session. Showing spinner.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Fallback to localStorage if state is in transition but storage is valid
  if (!user && !token) {
    console.log('[ProtectedRoute] Unauthorized access attempt (no user, no token). Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);
  if (!currentUser) {
    console.log('[ProtectedRoute] No user object found. Redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    const isAllowed = allowedRoles.includes(currentUser.role) || 
                      (allowedRoles.includes('admin') && currentUser.role === 'super-admin');
    
    console.log('[ProtectedRoute] Checking permissions:', {
      userRole: currentUser.role,
      allowedRoles,
      isAllowed
    });

    if (!isAllowed) {
      console.warn(`[ProtectedRoute] Access denied for role "${currentUser.role}". Redirecting to dashboard.`);
      // Determine fallback based on role
      if (currentUser.role === 'admin' || currentUser.role === 'super-admin') {
        return <Navigate to="/admin-dashboard" replace />;
      }
      if (currentUser.role === 'owner') {
        return <Navigate to="/owner-dashboard" replace />;
      }
      return <Navigate to="/staff-dashboard" replace />;
    }
  }

  console.log('[ProtectedRoute] Access granted. Rendering children.');
  return children;
}
