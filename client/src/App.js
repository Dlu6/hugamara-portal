import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import "./styles/App.css";

// Auth Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthTest from "./components/auth/AuthTest";

// Main Pages
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Guests from "./pages/Guests";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import AccessControl from "./components/auth/AccessControl";

// Layout Components
import UnifiedLayout from "./components/layout/UnifiedLayout";

// Route Configuration
import { ROUTES } from "./config/routes";

// Redux
import {
  getCurrentUser,
  selectIsAuthenticated,
} from "./store/slices/authSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path={ROUTES.LOGIN.path}
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path={ROUTES.REGISTER.path}
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />

        {/* Protected Routes with Unified Layout */}
        <Route
          path={ROUTES.DASHBOARD.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.DASHBOARD}>
              <UnifiedLayout title={ROUTES.DASHBOARD.title}>
                <Dashboard />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute routeConfig={ROUTES.DASHBOARD}>
              <UnifiedLayout title={ROUTES.DASHBOARD.title}>
                <Dashboard />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.USER_MANAGEMENT.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.USER_MANAGEMENT}>
              <UnifiedLayout 
                title={ROUTES.USER_MANAGEMENT.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "User Management" }
                ]}
              >
                <UserManagement />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.RESERVATIONS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.RESERVATIONS}>
              <UnifiedLayout 
                title={ROUTES.RESERVATIONS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Reservations" }
                ]}
              >
                <Reservations />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ORDERS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.ORDERS}>
              <UnifiedLayout 
                title={ROUTES.ORDERS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Orders" }
                ]}
              >
                <Orders />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.INVENTORY.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.INVENTORY}>
              <UnifiedLayout 
                title={ROUTES.INVENTORY.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Inventory" }
                ]}
              >
                <Inventory />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.GUESTS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.GUESTS}>
              <UnifiedLayout 
                title={ROUTES.GUESTS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Guests" }
                ]}
              >
                <Guests />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.EVENTS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.EVENTS}>
              <UnifiedLayout 
                title={ROUTES.EVENTS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Events & Promotions" }
                ]}
              >
                <Events />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.REPORTS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.REPORTS}>
              <UnifiedLayout 
                title={ROUTES.REPORTS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Reports & Analytics" }
                ]}
              >
                <Reports />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SETTINGS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.SETTINGS}>
              <UnifiedLayout 
                title={ROUTES.SETTINGS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Settings" }
                ]}
              >
                <Settings />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.USER_PROFILE.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.USER_PROFILE}>
              <UnifiedLayout 
                title={ROUTES.USER_PROFILE.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "User Profile" }
                ]}
              >
                <UserProfile />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ACCESS_CONTROL.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.ACCESS_CONTROL}>
              <UnifiedLayout 
                title={ROUTES.ACCESS_CONTROL.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Access Control" }
                ]}
              >
                <AccessControl />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        {/* Test Route */}
        <Route path="/auth-test" element={<AuthTest />} />

        {/* Unauthorized Route */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Access Denied
                </h1>
                <p className="text-gray-600">
                  You don't have permission to access this resource.
                </p>
              </div>
            </div>
          }
        />

        {/* Catch-all Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
