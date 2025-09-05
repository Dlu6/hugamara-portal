import React, { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Reservation Confirmed",
      message: "Table 5 reservation for 7:30 PM has been confirmed",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "warning",
      title: "Low Stock Alert",
      message: "Chicken breast is running low (5 items remaining)",
      time: "15 minutes ago",
      unread: true,
    },
    {
      id: 3,
      type: "info",
      title: "New Order",
      message: "Order #1234 has been placed for Table 3",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "success",
      title: "Payment Processed",
      message: "Payment of $45.50 has been successfully processed",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "warning",
      title: "Staff Shift Reminder",
      message: "John's shift starts in 30 minutes",
      time: "3 hours ago",
      unread: false,
    },
  ]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (!isOpen) return null;

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 bg-primary-bg border border-border rounded-lg shadow-lg z-50"
      ref={dropdownRef}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            Notifications
          </h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-accent-primary text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-text-secondary">
            No notifications
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-primary-bg-accent transition-colors cursor-pointer ${
                  notification.unread ? "bg-blue-50/10" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          notification.unread
                            ? "text-text-primary"
                            : "text-text-secondary"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-text-secondary mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <button className="w-full text-center text-sm text-accent-primary hover:text-accent-primary/80 transition-colors">
          Mark all as read
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
