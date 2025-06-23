import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, staffOnly = false }) => {
  const { user, loading, isAuthenticated, hasRole, isStaff, getDefaultPath } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }
  // Not authenticated - redirect to appropriate login
  if (!isAuthenticated()) {
    const loginPath = staffOnly ? '/login/staff' : '/login/patient';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  // Check if staff only route but user is patient
  if (staffOnly && !isStaff()) {
    return <Navigate to="/login/staff" state={{ from: location.pathname }} replace />;
  }

  // Check if patient only route but user is staff
  if (!staffOnly && isStaff() && location.pathname.startsWith('/')) {
    // Allow staff to access patient routes, but patients can't access staff routes
  }  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    const dashboardPath = getDefaultPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
