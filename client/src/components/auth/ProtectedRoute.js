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

  // If user is authenticated but user object not loaded yet, wait
  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check route access if routeConfig is provided
  if (routeConfig && !hasRouteAccess(routeConfig, user, permissions)) {
    // Avoid redirecting to the same route; send to unauthorized page if needed
    const redirectTarget =
      location.pathname === routeConfig.path ? "/unauthorized" : "/dashboard";
    return <Navigate to={redirectTarget} replace />;
  }

  return children;
};

export default ProtectedRoute;
