import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User has wrong role - redirect to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/salesman/parties';
    return <Navigate to={redirectPath} replace />;
  }

  // All good - show the page
  return children;
};

export default ProtectedRoute;