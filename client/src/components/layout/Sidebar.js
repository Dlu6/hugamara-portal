import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  Ticket,
  CalendarDays,
  BarChart3,
  Settings,
  Building2,
  LogOut,
  Package,
  ShoppingCart,
  Utensils,
  UserCheck,
  Clock,
  Shield,
  User,
  X,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import { setCurrentOutlet, fetchOutlets } from "../../store/slices/outletSlice";
import { getMainNavigationRoutes, hasRouteAccess } from "../../config/routes";

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, outletId, permissions } = useSelector((state) => state.auth);
  const { outlets, currentOutlet } = useSelector((state) => state.outlets);
  const [isMobile, setIsMobile] = useState(false);

  // Get menu items from route configuration
  const menuItems = getMainNavigationRoutes();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleOutletChange = (outletId) => {
    if (outletId) {
      const selectedOutlet = outlets.find((outlet) => outlet.id === outletId);
      dispatch(setCurrentOutlet(selectedOutlet));
    } else {
      dispatch(setCurrentOutlet(null));
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile sidebar after navigation
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`sidebar ${
          isMobile
            ? isOpen
              ? "sidebar-mobile-open"
              : "sidebar-mobile-closed"
            : ""
        }`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <div className="flex items-center space-x-3">
              <img
                src="/hugamara-logo.png"
                alt="Hugamara"
                className="w-8 h-8"
                style={{
                  filter:
                    "drop-shadow(0 0 8px rgba(255,255,255,0.35)) drop-shadow(0 4px 12px rgba(255,255,255,0.2))",
                }}
              />
              <h1 className="text-lg font-bold text-text-primary">Hugamara</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Logo and Brand */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <img
              src="/hugamara-logo.png"
              alt="Hugamara"
              className="w-12 h-12"
              style={{
                filter:
                  "drop-shadow(0 1px 1px rgb(255, 255, 255)) drop-shadow(0 3px 1px rgb(255, 255, 255))",
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-text-primary">Hugamara</h1>
              <p className="text-sm text-text-secondary">Management Portal</p>
            </div>
          </div>
        </div>

        {/* Outlet Selector */}
        {user?.role === "org_admin" && (
          <div className="p-4 border-b border-border">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Current Outlet
            </label>
            <select
              value={currentOutlet || ""}
              onChange={(e) => handleOutletChange(e.target.value)}
              className="w-full bg-primary-bg-secondary border border-border text-text-primary rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Outlets</option>
              {outlets?.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems
              .filter((item) => hasRouteAccess(item, user, permissions))
              .map((item) => {
                // Dynamic icon mapping
                const iconMap = {
                  Home,
                  Shield,
                  Building2,
                  ShoppingCart,
                  Calendar,
                  UserCheck,
                  Package,
                  Utensils,
                  Users,
                  Clock,
                  Ticket,
                  CalendarDays,
                  BarChart3,
                  Settings,
                  User,
                };
                const Icon = iconMap[item.icon] || Home;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-accent-primary text-white shadow-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.title || item.label}
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-text-primary">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-text-secondary capitalize">
                {user?.role || "Staff"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
