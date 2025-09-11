import React from "react";
import {
  X,
  Plus,
  Calendar,
  ShoppingCart,
  Package,
  Users,
  Ticket,
  ChefHat,
  BarChart3,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActionsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: "new-reservation",
      title: "New Reservation",
      description: "Create a new table reservation",
      icon: Calendar,
      color: "bg-blue-500",
      action: () => {
        navigate("/reservations");
        onClose();
      },
    },
    {
      id: "new-order",
      title: "New Order",
      description: "Start a new food order",
      icon: ShoppingCart,
      color: "bg-green-500",
      action: () => {
        navigate("/orders");
        onClose();
      },
    },
    {
      id: "add-guest",
      title: "Add Guest",
      description: "Register a new guest",
      icon: Users,
      color: "bg-purple-500",
      action: () => {
        navigate("/guests");
        onClose();
      },
    },
    {
      id: "add-staff",
      title: "Add Staff",
      description: "Add new staff member",
      icon: Users,
      color: "bg-orange-500",
      action: () => {
        navigate("/staff");
        onClose();
      },
    },
    {
      id: "add-menu-item",
      title: "Add Menu Item",
      description: "Create new menu item",
      icon: ChefHat,
      color: "bg-red-500",
      action: () => {
        navigate("/menu");
        onClose();
      },
    },
    {
      id: "add-inventory",
      title: "Add Inventory",
      description: "Add inventory item",
      icon: Package,
      color: "bg-indigo-500",
      action: () => {
        navigate("/inventory");
        onClose();
      },
    },
    {
      id: "create-event",
      title: "Create Event",
      description: "Plan a new event",
      icon: Calendar,
      color: "bg-pink-500",
      action: () => {
        navigate("/events");
        onClose();
      },
    },
    {
      id: "create-ticket",
      title: "Create Ticket",
      description: "Open support ticket",
      icon: Ticket,
      color: "bg-yellow-500",
      action: () => {
        navigate("/tickets");
        onClose();
      },
    },
    {
      id: "view-reports",
      title: "View Reports",
      description: "Access analytics dashboard",
      icon: BarChart3,
      color: "bg-teal-500",
      action: () => {
        navigate("/reports");
        onClose();
      },
    },
    {
      id: "settings",
      title: "Settings",
      description: "Manage system settings",
      icon: Settings,
      color: "bg-gray-500",
      action: () => {
        navigate("/settings");
        onClose();
      },
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen pt-16 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="inline-block align-bottom bg-primary-bg rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-primary-bg border-b border-border px-6 pt-6 pb-4 rounded-t-lg z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Quick Actions
              </h3>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary text-3xl font-bold p-2 hover:bg-primary-bg-accent rounded-full transition-colors"
                title="Close Modal"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="flex items-start p-4 rounded-lg bg-primary-bg-secondary hover:bg-primary-bg-accent transition-colors text-left group"
                  >
                    <div
                      className={`p-3 rounded-lg ${action.color} mr-4 flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">
                  Click any action to navigate to the relevant page
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary-bg-secondary text-text-primary text-sm font-medium rounded-md hover:bg-primary-bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsModal;
