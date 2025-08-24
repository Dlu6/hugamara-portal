import React from "react";
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
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, outletId } = useSelector((state) => state.auth);
  const { outlets, currentOutlet } = useSelector((state) => state.outlet);

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/reservations", icon: Calendar, label: "Reservations" },
    { path: "/guests", icon: Users, label: "Guests" },
    { path: "/tickets", icon: Ticket, label: "Tickets" },
    { path: "/events", icon: CalendarDays, label: "Events" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/reports", icon: BarChart3, label: "Reports" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleOutletChange = (outletId) => {
    // Dispatch action to change current outlet
    // This would be implemented in the outlet slice
  };

  return (
    <div className="sidebar">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary">Hugamara</h1>
        <p className="text-sm text-text-secondary">Management Portal</p>
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-primary text-white shadow-medium"
                      : "text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
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
  );
};

export default Sidebar;
