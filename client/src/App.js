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
import LoginHospitality from "./pages/LoginHospitality";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Main Pages
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Guests from "./pages/Guests";
import MenuManagement from "./pages/MenuManagement";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";
import AccessControl from "./components/auth/AccessControl";
import Outlets from "./pages/Outlets";
import OutletDetail from "./pages/OutletDetail";
import Tables from "./pages/Tables";
import Staff from "./pages/Staff";
import ShiftManagement from "./pages/ShiftManagement";
import SupportTickets from "./pages/SupportTickets";
import EventManagement from "./pages/EventManagement";

// Layout Components
import UnifiedLayout from "./components/layout/UnifiedLayout";

// Route Configuration
import { ROUTES } from "./config/routes";
import { ToastProvider } from "./components/ui/ToastProvider";

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
    if (token) {
      // Always hydrate user from backend when a token exists
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
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginHospitality />
            )
          }
        />
        <Route
          path={ROUTES.REGISTER.path}
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
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
                  { label: "User Management" },
                ]}
              >
                <UserManagement />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.OUTLET_MANAGEMENT.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.OUTLET_MANAGEMENT}>
              <UnifiedLayout
                title={ROUTES.OUTLET_MANAGEMENT.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Outlet Management" },
                ]}
              >
                <Outlets />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/outlets/:id"
          element={
            <ProtectedRoute routeConfig={ROUTES.OUTLET_MANAGEMENT}>
              <UnifiedLayout
                title="Outlet Detail"
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Outlet Management", link: "/outlets" },
                  { label: "Detail" },
                ]}
              >
                <OutletDetail />
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
                  { label: "Reservations" },
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
                  { label: "Orders" },
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
                  { label: "Inventory" },
                ]}
              >
                <Inventory />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.TABLES.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.TABLES}>
              <UnifiedLayout
                title={ROUTES.TABLES.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Tables" },
                ]}
              >
                <Tables />
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
                  { label: "Guests" },
                ]}
              >
                <Guests />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.MENU.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.MENU}>
              <UnifiedLayout
                title={ROUTES.MENU.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Menu Management" },
                ]}
              >
                <MenuManagement />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.STAFF.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.STAFF}>
              <UnifiedLayout
                title={ROUTES.STAFF.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Staff Management" },
                ]}
              >
                <Staff />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SHIFTS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.SHIFTS}>
              <UnifiedLayout
                title={ROUTES.SHIFTS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Shift Management" },
                ]}
              >
                <ShiftManagement />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.TICKETS.path}
          element={
            <ProtectedRoute routeConfig={ROUTES.TICKETS}>
              <UnifiedLayout
                title={ROUTES.TICKETS.title}
                breadcrumbs={[
                  { label: "Dashboard", link: "/dashboard" },
                  { label: "Support Tickets" },
                ]}
              >
                <SupportTickets />
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
                  { label: "Events & Promotions" },
                ]}
              >
                <EventManagement />
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
                  { label: "Reports & Analytics" },
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
                  { label: "Settings" },
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
                  { label: "User Profile" },
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
                  { label: "Access Control" },
                ]}
              >
                <AccessControl />
              </UnifiedLayout>
            </ProtectedRoute>
          }
        />

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
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Provider>
  );
};

export default App;
