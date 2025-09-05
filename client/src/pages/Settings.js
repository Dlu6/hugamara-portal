import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings as SettingsIcon,
  Building2,
  User,
  Shield,
  BarChart3,
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Bell,
  Palette,
  Languages,
} from "lucide-react";
import {
  fetchSystemSettings,
  updateSystemSettings,
  updateOutletInfo,
  fetchUserPreferences,
  updateUserPreferences,
  fetchRolesAndPermissions,
  updateRolePermissions,
  fetchSystemStats,
  backupSystemData,
  setActiveTab,
  updateOutletForm,
  updateSettingsForm,
  updatePreferencesForm,
  clearError,
} from "../store/slices/settingsSlice";

const Settings = () => {
  const dispatch = useDispatch();
  const {
    outlet,
    systemSettings,
    userPreferences,
    roles,
    permissions,
    systemStats,
    loading,
    error,
    outletForm,
    settingsForm,
    preferencesForm,
    outletFormErrors,
    settingsFormErrors,
    preferencesFormErrors,
    activeTab,
  } = useSelector((state) => state.settings);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchSystemSettings());
    dispatch(fetchUserPreferences());
    dispatch(fetchRolesAndPermissions());
    dispatch(fetchSystemStats());
  }, [dispatch]);

  const tabs = [
    { id: "outlet", label: "Outlet Info", icon: Building2 },
    { id: "system", label: "System Settings", icon: SettingsIcon },
    { id: "preferences", label: "User Preferences", icon: User },
    { id: "permissions", label: "Roles & Permissions", icon: Shield },
    { id: "stats", label: "System Stats", icon: BarChart3 },
    { id: "backup", label: "Backup & Restore", icon: Database },
  ];

  const handleTabChange = (tabId) => {
    dispatch(setActiveTab(tabId));
    dispatch(clearError());
  };

  const handleOutletFormChange = (field, value) => {
    dispatch(updateOutletForm({ [field]: value }));
  };

  const handleSettingsFormChange = (field, value) => {
    dispatch(updateSettingsForm({ [field]: value }));
  };

  const handlePreferencesFormChange = (field, value) => {
    dispatch(updatePreferencesForm({ [field]: value }));
  };

  const handleOutletSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateOutletInfo(outletForm)).unwrap();
      setSuccessMessage("Outlet information updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating outlet info:", error);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSystemSettings(settingsForm)).unwrap();
      setSuccessMessage("System settings updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating system settings:", error);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserPreferences(preferencesForm)).unwrap();
      setSuccessMessage("User preferences updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating user preferences:", error);
    }
  };

  const handleBackup = async () => {
    try {
      await dispatch(backupSystemData()).unwrap();
      setSuccessMessage("System backup created successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  };

  const handleRolePermissionChange = async (roleId, permissionIds) => {
    try {
      await dispatch(updateRolePermissions({ roleId, permissionIds })).unwrap();
      setSuccessMessage("Role permissions updated successfully");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating role permissions:", error);
    }
  };

  const renderOutletTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Outlet Information
        </h3>

        <form onSubmit={handleOutletSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Outlet Name
              </label>
              <input
                type="text"
                value={outletForm.name}
                onChange={(e) => handleOutletFormChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={outletForm.phone}
                onChange={(e) =>
                  handleOutletFormChange("phone", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                value={outletForm.email}
                onChange={(e) =>
                  handleOutletFormChange("email", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Timezone
              </label>
              <select
                value={outletForm.timezone}
                onChange={(e) =>
                  handleOutletFormChange("timezone", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Currency
              </label>
              <select
                value={outletForm.currency}
                onChange={(e) =>
                  handleOutletFormChange("currency", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={outletForm.taxRate}
                onChange={(e) =>
                  handleOutletFormChange("taxRate", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Service Charge (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={outletForm.serviceCharge}
                onChange={(e) =>
                  handleOutletFormChange(
                    "serviceCharge",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Delivery Fee
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={outletForm.deliveryFee}
                onChange={(e) =>
                  handleOutletFormChange(
                    "deliveryFee",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Address
            </label>
            <textarea
              value={outletForm.address}
              onChange={(e) =>
                handleOutletFormChange("address", e.target.value)
              }
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Outlet Information
          </button>
        </form>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <SettingsIcon className="w-5 h-5 mr-2" />
          System Configuration
        </h3>

        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Max Tables
              </label>
              <input
                type="number"
                min="1"
                value={settingsForm.maxTables}
                onChange={(e) =>
                  handleSettingsFormChange(
                    "maxTables",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Max Staff Per Shift
              </label>
              <input
                type="number"
                min="1"
                value={settingsForm.maxStaffPerShift}
                onChange={(e) =>
                  handleSettingsFormChange(
                    "maxStaffPerShift",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reservation Time Limit (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={settingsForm.reservationTimeLimit}
                onChange={(e) =>
                  handleSettingsFormChange(
                    "reservationTimeLimit",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Order Timeout (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={settingsForm.orderTimeout}
                onChange={(e) =>
                  handleSettingsFormChange(
                    "orderTimeout",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Auto Logout Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={settingsForm.autoLogoutTime}
                onChange={(e) =>
                  handleSettingsFormChange(
                    "autoLogoutTime",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Default Language
              </label>
              <select
                value={settingsForm.defaultLanguage}
                onChange={(e) =>
                  handleSettingsFormChange("defaultLanguage", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-md font-medium text-text-primary">
              Notifications
            </h4>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settingsForm.enableNotifications}
                  onChange={(e) =>
                    handleSettingsFormChange(
                      "enableNotifications",
                      e.target.checked
                    )
                  }
                  className="mr-2"
                />
                Enable Notifications
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settingsForm.enableEmailNotifications}
                  onChange={(e) =>
                    handleSettingsFormChange(
                      "enableEmailNotifications",
                      e.target.checked
                    )
                  }
                  className="mr-2"
                />
                Email Notifications
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settingsForm.enableSMSNotifications}
                  onChange={(e) =>
                    handleSettingsFormChange(
                      "enableSMSNotifications",
                      e.target.checked
                    )
                  }
                  className="mr-2"
                />
                SMS Notifications
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save System Settings
          </button>
        </form>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          User Preferences
        </h3>

        <form onSubmit={handlePreferencesSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Theme
              </label>
              <select
                value={preferencesForm.theme}
                onChange={(e) =>
                  handlePreferencesFormChange("theme", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Language
              </label>
              <select
                value={preferencesForm.language}
                onChange={(e) =>
                  handlePreferencesFormChange("language", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Date Format
              </label>
              <select
                value={preferencesForm.dateFormat}
                onChange={(e) =>
                  handlePreferencesFormChange("dateFormat", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Time Format
              </label>
              <select
                value={preferencesForm.timeFormat}
                onChange={(e) =>
                  handlePreferencesFormChange("timeFormat", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-md font-medium text-text-primary">
              Notification Preferences
            </h4>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesForm.notifications.email}
                  onChange={(e) =>
                    handlePreferencesFormChange("notifications", {
                      ...preferencesForm.notifications,
                      email: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Email Notifications
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesForm.notifications.push}
                  onChange={(e) =>
                    handlePreferencesFormChange("notifications", {
                      ...preferencesForm.notifications,
                      push: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                Push Notifications
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferencesForm.notifications.sms}
                  onChange={(e) =>
                    handlePreferencesFormChange("notifications", {
                      ...preferencesForm.notifications,
                      sms: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                SMS Notifications
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Roles & Permissions
        </h3>

        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-border rounded-lg p-4">
              <h4 className="text-md font-medium text-text-primary mb-3">
                {role.name}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {permissions.map((permission) => {
                  const hasPermission = role.permissions?.some(
                    (p) => p.id === permission.id
                  );
                  return (
                    <label
                      key={permission.id}
                      className="flex items-center text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        onChange={(e) => {
                          const currentPermissionIds =
                            role.permissions?.map((p) => p.id) || [];
                          const newPermissionIds = e.target.checked
                            ? [...currentPermissionIds, permission.id]
                            : currentPermissionIds.filter(
                                (id) => id !== permission.id
                              );
                          handleRolePermissionChange(role.id, newPermissionIds);
                        }}
                        className="mr-2"
                      />
                      {permission.name}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          System Statistics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {systemStats.totalUsers || 0}
            </div>
            <div className="text-sm text-text-secondary">Total Users</div>
          </div>

          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {systemStats.totalStaff || 0}
            </div>
            <div className="text-sm text-text-secondary">Total Staff</div>
          </div>

          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {systemStats.totalTables || 0}
            </div>
            <div className="text-sm text-text-secondary">Total Tables</div>
          </div>

          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {systemStats.totalMenuItems || 0}
            </div>
            <div className="text-sm text-text-secondary">Menu Items</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <div className="text-lg font-semibold text-text-primary mb-2">
              System Info
            </div>
            <div className="space-y-1 text-sm text-text-secondary">
              <div>Node Version: {systemStats.nodeVersion}</div>
              <div>Platform: {systemStats.platform}</div>
              <div>
                Uptime:{" "}
                {systemStats.systemUptime
                  ? Math.floor(systemStats.systemUptime / 3600)
                  : 0}{" "}
                hours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Backup & Restore
        </h3>

        <div className="space-y-4">
          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <h4 className="text-md font-medium text-text-primary mb-2">
              Create Backup
            </h4>
            <p className="text-sm text-text-secondary mb-4">
              Create a backup of your system data including settings, users, and
              configurations.
            </p>
            <button
              onClick={handleBackup}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Create Backup
            </button>
          </div>

          <div className="bg-primary-bg-secondary p-4 rounded-lg">
            <h4 className="text-md font-medium text-text-primary mb-2">
              Restore Data
            </h4>
            <p className="text-sm text-text-secondary mb-4">
              Restore system data from a previous backup. This action cannot be
              undone.
            </p>
            <div className="text-sm text-text-secondary">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Restore functionality requires manual implementation with proper
              validation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "outlet":
        return renderOutletTab();
      case "system":
        return renderSystemTab();
      case "preferences":
        return renderPreferencesTab();
      case "permissions":
        return renderPermissionsTab();
      case "stats":
        return renderStatsTab();
      case "backup":
        return renderBackupTab();
      default:
        return renderOutletTab();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">
            System configuration and user preferences
          </p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-accent-primary text-accent-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default Settings;
