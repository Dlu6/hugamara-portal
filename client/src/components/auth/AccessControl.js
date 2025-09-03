import React, { useState } from "react";
import {
  Shield,
  Users,
  Building2,
  ShoppingCart,
  Calendar,
  Package,
  Utensils,
  BarChart3,
  UserCheck,
  Clock,
  MessageSquare,
  Calendar as EventCalendar,
  Eye,
  EyeOff,
} from "lucide-react";

const AccessControl = () => {
  const [selectedRole, setSelectedRole] = useState("org_admin");
  const [showDetails, setShowDetails] = useState(false);

  // Module definitions with icons and descriptions
  const modules = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: BarChart3,
      description: "Overview and analytics",
    },
    {
      id: "users",
      name: "User Management",
      icon: Users,
      description: "Manage users and permissions",
    },
    {
      id: "outlets",
      name: "Outlet Management",
      icon: Building2,
      description: "Manage outlets and settings",
    },
    {
      id: "orders",
      name: "Order Management",
      icon: ShoppingCart,
      description: "Process orders and payments",
    },
    {
      id: "reservations",
      name: "Reservation Management",
      icon: Calendar,
      description: "Manage table reservations",
    },
    {
      id: "inventory",
      name: "Inventory Management",
      icon: Package,
      description: "Track stock and supplies",
    },
    {
      id: "menu",
      name: "Menu Management",
      icon: Utensils,
      description: "Manage menu items and pricing",
    },
    {
      id: "guests",
      name: "Guest Management",
      icon: UserCheck,
      description: "Customer relationship management",
    },
    {
      id: "staff",
      name: "Staff Management",
      icon: Users,
      description: "Manage staff and shifts",
    },
    {
      id: "shifts",
      name: "Shift Management",
      icon: Clock,
      description: "Schedule and track shifts",
    },
    {
      id: "tickets",
      name: "Support Tickets",
      icon: MessageSquare,
      description: "Handle support requests",
    },
    {
      id: "events",
      name: "Events & Promotions",
      icon: EventCalendar,
      description: "Manage events and promotions",
    },
    {
      id: "reports",
      name: "Financial Reports",
      icon: BarChart3,
      description: "View financial analytics",
    },
  ];

  // Role definitions with detailed permissions
  const roles = [
    {
      value: "org_admin",
      label: "Organization Admin",
      description: "Full system access across all outlets",
      color: "bg-red-100 text-red-800",
      permissions: [
        "dashboard",
        "users",
        "outlets",
        "orders",
        "reservations",
        "inventory",
        "menu",
        "guests",
        "staff",
        "shifts",
        "tickets",
        "events",
        "reports",
      ],
    },
    {
      value: "general_manager",
      label: "General Manager",
      description: "Outlet management and operations",
      color: "bg-blue-100 text-blue-800",
      permissions: [
        "dashboard",
        "outlets",
        "orders",
        "reservations",
        "inventory",
        "menu",
        "guests",
        "staff",
        "shifts",
        "tickets",
        "events",
        "reports",
      ],
    },
    {
      value: "supervisor",
      label: "Supervisor",
      description: "Team supervision and operational tasks",
      color: "bg-green-100 text-green-800",
      permissions: [
        "dashboard",
        "orders",
        "reservations",
        "inventory",
        "menu",
        "guests",
        "tickets",
      ],
    },
    {
      value: "staff",
      label: "Staff",
      description: "Basic operational tasks",
      color: "bg-gray-100 text-gray-800",
      permissions: ["dashboard", "orders", "reservations", "inventory", "menu"],
    },
    {
      value: "marketing_crm",
      label: "Marketing & CRM",
      description: "Guest management and marketing",
      color: "bg-purple-100 text-purple-800",
      permissions: ["dashboard", "guests", "reservations", "events"],
    },
    {
      value: "finance",
      label: "Finance",
      description: "Financial reporting and payments",
      color: "bg-yellow-100 text-yellow-800",
      permissions: ["dashboard", "orders", "reports"],
    },
  ];

  const selectedRoleData = roles.find((role) => role.value === selectedRole);

  const hasPermission = (moduleId) => {
    return selectedRoleData?.permissions.includes(moduleId) || false;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-indigo-600" />
          Access Control & Permissions
        </h2>
        <p className="text-gray-600">
          Define what modules each role can access across the hospitality system
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Role to View Permissions
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedRole === role.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${role.color}`}
              >
                {role.label}
              </div>
              <p className="text-xs text-gray-600">{role.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Role Details */}
      {selectedRoleData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedRoleData.label}
              </h3>
              <p className="text-gray-600">{selectedRoleData.description}</p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              {showDetails ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Module Access:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedRoleData.permissions.map((permission) => {
                  const module = modules.find((m) => m.id === permission);
                  if (!module) return null;

                  return (
                    <div
                      key={permission}
                      className="flex items-center gap-3 p-2 bg-green-50 rounded-lg"
                    >
                      <module.icon className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {module.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {module.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Module Access Matrix */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Module
              </th>
              {roles.map((role) => (
                <th
                  key={role.value}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}
                    >
                      {role.label}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map((module) => (
              <tr key={module.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <module.icon className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {module.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {module.description}
                      </div>
                    </div>
                  </div>
                </td>
                {roles.map((role) => {
                  const hasAccess = role.permissions.includes(module.id);
                  return (
                    <td
                      key={role.value}
                      className="px-6 py-4 whitespace-nowrap text-center"
                    >
                      <div
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                          hasAccess
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {hasAccess ? "✓" : "✗"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">
              ✓
            </div>
            <span className="text-sm text-gray-600">Has Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm">
              ✗
            </div>
            <span className="text-sm text-gray-600">No Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;
