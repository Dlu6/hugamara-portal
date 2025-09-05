import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Bell, Search, Menu, X } from "lucide-react";

const Header = ({ onMenuClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { outlets, currentOutlet } = useSelector((state) => state.outlets);

  const currentOutletName =
    outlets?.find((o) => o.id === currentOutlet)?.name || "All Outlets";

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  return (
    <header className="header">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and outlet info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuClick}
            className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-text-primary">
              {currentOutletName}
            </h2>
            <p className="text-sm text-text-secondary">
              Welcome back, {user?.name || "User"}
            </p>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search guests, reservations, tickets..."
              className="w-full pl-10 pr-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
            />
          </div>
        </div>

        {/* Right side - Notifications and user actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {/* Quick Actions */}
          <div className="hidden sm:flex space-x-2">
            <button className="px-3 py-2 bg-accent-primary text-white text-sm font-medium rounded-md hover:bg-accent-primary/90 transition-colors shadow-light">
              New Reservation
            </button>
            <button className="px-3 py-2 bg-primary-bg-secondary border border-border text-text-primary text-sm font-medium rounded-md hover:bg-primary-bg-accent transition-colors">
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 lg:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
