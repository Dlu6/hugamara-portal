import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Menu, X } from "lucide-react";
import SearchModal from "../SearchModal";
import QuickActionsModal from "../QuickActionsModal";
import NotificationDropdown from "../NotificationDropdown";

const Header = ({ onMenuClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { outlets, currentOutlet } = useSelector((state) => state.outlets);

  const currentOutletData =
    outlets?.find((o) => o.id === currentOutlet) || user?.outlet;
  const currentOutletName = currentOutletData?.name || "All Outlets";
  const currentOutletType = currentOutletData?.type;

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleNewReservation = () => {
    navigate("/reservations");
  };

  const handleQuickActions = () => {
    setIsQuickActionsOpen(true);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
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
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-text-primary">
                {currentOutletName}
              </h2>
              {currentOutletType && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {currentOutletType}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-text-secondary">
                Welcome back,{" "}
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || "User"}
              </p>
              {user?.role && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search guests, reservations, tickets..."
              className="w-full pl-10 pr-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
          </div>
        </div>

        {/* Right side - Notifications and user actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* Quick Actions */}
          <div className="hidden sm:flex space-x-2">
            <button
              onClick={handleNewReservation}
              className="px-3 py-2 bg-accent-primary text-white text-sm font-medium rounded-md hover:bg-accent-primary/90 transition-colors shadow-light"
            >
              New Reservation
            </button>
            <button
              onClick={handleQuickActions}
              className="px-3 py-2 bg-primary-bg-secondary border border-border text-text-primary text-sm font-medium rounded-md hover:bg-primary-bg-accent transition-colors"
            >
              Quick Actions
            </button>
          </div>
        </div>
      </div>

      {/* Mobile User Info and Search */}
      <div className="mt-4 lg:hidden space-y-3">
        {/* Mobile User Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-text-primary">
                {currentOutletName}
              </h3>
              {currentOutletType && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {currentOutletType}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-xs text-text-secondary">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || "User"}
              </p>
              {user?.role && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
            readOnly
          />
        </div>

        {/* Mobile Quick Actions */}
        <div className="flex space-x-2">
          <button
            onClick={handleNewReservation}
            className="flex-1 px-3 py-2 bg-accent-primary text-white text-sm font-medium rounded-md hover:bg-accent-primary/90 transition-colors"
          >
            New Reservation
          </button>
          <button
            onClick={handleQuickActions}
            className="flex-1 px-3 py-2 bg-primary-bg-secondary border border-border text-text-primary text-sm font-medium rounded-md hover:bg-primary-bg-accent transition-colors"
          >
            Quick Actions
          </button>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Quick Actions Modal */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
      />
    </header>
  );
};

export default Header;
