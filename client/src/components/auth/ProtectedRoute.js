import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { hasRouteAccess } from "../../config/routes";

const ProtectedRoute = ({ children, routeConfig }) => {
  const { isAuthenticated, user, permissions, loading } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check route access if routeConfig is provided
  if (routeConfig && !hasRouteAccess(routeConfig, user, permissions)) {
    // Redirect to dashboard if user doesn't have access
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
