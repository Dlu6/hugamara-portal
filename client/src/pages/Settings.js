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
  Download,
  Upload,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  X,
  Plus,
  Minus,
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
  restoreSystemData,
  setActiveTab,
  updateOutletForm,
  updateSettingsForm,
  updatePreferencesForm,
  clearError,
  resetOutletForm,
  resetSettingsForm,
  resetPreferencesForm,
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
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreData, setRestoreData] = useState("");
  const [showOperatingHours, setShowOperatingHours] = useState(false);
  const [operatingHours, setOperatingHours] = useState({});
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchSystemSettings());
    dispatch(fetchUserPreferences());
    dispatch(fetchRolesAndPermissions());
    dispatch(fetchSystemStats());
  }, [dispatch]);

  // Initialize operating hours when outlet data is loaded
  useEffect(() => {
    if (outlet?.operatingHours) {
      setOperatingHours(outlet.operatingHours);
    }
  }, [outlet]);

  const tabs = [
    {
      id: "outlet",
      label: "Outlet Info",
      icon: Building2,
      description: "Manage outlet details and operating hours",
    },
    {
      id: "system",
      label: "System Settings",
      icon: SettingsIcon,
      description: "Configure system-wide settings",
    },
    {
      id: "preferences",
      label: "User Preferences",
      icon: User,
      description: "Personalize your experience",
    },
    {
      id: "permissions",
      label: "Roles & Permissions",
      icon: Shield,
      description: "Manage user roles and access",
    },
    {
      id: "stats",
      label: "System Stats",
      icon: BarChart3,
      description: "View system performance metrics",
    },
    {
      id: "backup",
      label: "Backup & Restore",
      icon: Database,
      description: "Data backup and recovery",
    },
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

  const showSuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleOutletSubmit = async (e) => {
    e.preventDefault();
    try {
      const outletData = {
        ...outletForm,
        operatingHours: operatingHours,
      };
      await dispatch(updateOutletInfo(outletData)).unwrap();
      showSuccessToast("Outlet information updated successfully");
    } catch (error) {
      console.error("Error updating outlet info:", error);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateSystemSettings(settingsForm)).unwrap();
      showSuccessToast("System settings updated successfully");
    } catch (error) {
      console.error("Error updating system settings:", error);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateUserPreferences(preferencesForm)).unwrap();
      showSuccessToast("User preferences updated successfully");
    } catch (error) {
      console.error("Error updating user preferences:", error);
    }
  };

  const handleBackup = async () => {
    try {
      await dispatch(backupSystemData()).unwrap();
      showSuccessToast("System backup created successfully");
    } catch (error) {
      console.error("Error creating backup:", error);
    }
  };

  const handleRestore = async () => {
    if (!restoreData.trim()) {
      alert("Please enter backup data to restore");
      return;
    }

    try {
      await dispatch(restoreSystemData(restoreData)).unwrap();
      showSuccessToast("System data restored successfully");
      setShowRestoreModal(false);
      setRestoreData("");
    } catch (error) {
      console.error("Error restoring data:", error);
    }
  };

  const handleRolePermissionChange = async (roleId, permissionIds) => {
    try {
      await dispatch(updateRolePermissions({ roleId, permissionIds })).unwrap();
      showSuccessToast("Role permissions updated successfully");
    } catch (error) {
      console.error("Error updating role permissions:", error);
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const resetForm = (formType) => {
    switch (formType) {
      case "outlet":
        dispatch(resetOutletForm());
        setOperatingHours({});
        break;
      case "settings":
        dispatch(resetSettingsForm());
        break;
      case "preferences":
        dispatch(resetPreferencesForm());
        break;
      default:
        break;
    }
  };

  const refreshData = () => {
    dispatch(fetchSystemSettings());
    dispatch(fetchUserPreferences());
    dispatch(fetchRolesAndPermissions());
    dispatch(fetchSystemStats());
    showSuccessToast("Data refreshed successfully");
  };

  const renderOutletTab = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Outlet Information
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => resetForm("outlet")}
              className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
        </div>

        <form onSubmit={handleOutletSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Outlet Name *
              </label>
              <input
                type="text"
                value={outletForm.name}
                onChange={(e) => handleOutletFormChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                required
                placeholder="Enter outlet name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Branch Manager Phone Number
              </label>
              <input
                type="tel"
                value={outletForm.phone}
                onChange={(e) =>
                  handleOutletFormChange("phone", e.target.value)
                }
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                placeholder="+256 700 000-000"
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
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                placeholder="outlet@example.com"
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
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Africa/Kampala">Africa/Kampala</option>
                <option value="Europe/London">Europe/London</option>
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
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="UGX">UGX - Ugandan Shilling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={outletForm.taxRate * 100}
                  onChange={(e) =>
                    handleOutletFormChange(
                      "taxRate",
                      parseFloat(e.target.value) / 100
                    )
                  }
                  className="w-full px-3 py-2 pr-8 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="10.00"
                />
                <span className="absolute right-3 top-2 text-text-secondary">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Service Charge (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={outletForm.serviceCharge * 100}
                  onChange={(e) =>
                    handleOutletFormChange(
                      "serviceCharge",
                      parseFloat(e.target.value) / 100
                    )
                  }
                  className="w-full px-3 py-2 pr-8 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="5.00"
                />
                <span className="absolute right-3 top-2 text-text-secondary">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Delivery Fee
              </label>
              <div className="relative">
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
                  className="w-full px-3 py-2 pr-8 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-2 text-text-secondary">
                  {outletForm.currency}
                </span>
              </div>
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
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
              placeholder="Enter complete address"
            />
          </div>

          {/* Operating Hours Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-text-primary flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Operating Hours
              </h4>
              <button
                type="button"
                onClick={() => setShowOperatingHours(!showOperatingHours)}
                className="flex items-center text-sm text-accent-primary hover:text-accent-primary-dark"
              >
                {showOperatingHours ? (
                  <EyeOff className="w-4 h-4 mr-1" />
                ) : (
                  <Eye className="w-4 h-4 mr-1" />
                )}
                {showOperatingHours ? "Hide" : "Show"} Hours
              </button>
            </div>

            {showOperatingHours && (
              <div className="space-y-4">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className="flex items-center space-x-4 p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="w-20 text-sm font-medium text-text-primary capitalize">
                      {day}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={operatingHours[day]?.isOpen || false}
                        onChange={(e) =>
                          handleOperatingHoursChange(
                            day,
                            "isOpen",
                            e.target.checked
                          )
                        }
                        className="rounded border-border"
                      />
                      <span className="text-sm text-text-secondary">Open</span>
                    </div>
                    {operatingHours[day]?.isOpen && (
                      <>
                        <input
                          type="time"
                          value={operatingHours[day]?.open || "09:00"}
                          onChange={(e) =>
                            handleOperatingHoursChange(
                              day,
                              "open",
                              e.target.value
                            )
                          }
                          className="px-2 py-1 border border-border rounded bg-neutral-700 text-text-primary"
                        />
                        <span className="text-text-secondary">to</span>
                        <input
                          type="time"
                          value={operatingHours[day]?.close || "17:00"}
                          onChange={(e) =>
                            handleOperatingHoursChange(
                              day,
                              "close",
                              e.target.value
                            )
                          }
                          className="px-2 py-1 border border-border rounded bg-neutral-700 text-text-primary"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => resetForm("outlet")}
              className="px-4 py-2 border border-border text-text-primary rounded-md hover:bg-neutral-700"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Outlet Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            System Configuration
          </h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
            >
              <SettingsIcon className="w-4 h-4 mr-1" />
              {showAdvancedSettings ? "Hide" : "Show"} Advanced
            </button>
            <button
              type="button"
              onClick={() => resetForm("settings")}
              className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-text-primary flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Basic Settings
            </h4>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="50"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Maximum number of tables in the outlet
                </p>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="20"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Maximum staff members per shift
                </p>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="30"
                />
                <p className="text-xs text-text-secondary mt-1">
                  How long to hold reservations
                </p>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="15"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Auto-cancel pending orders after this time
                </p>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  placeholder="480"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Auto-logout inactive users (8 hours = 480 minutes)
                </p>
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
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="sw">Swahili</option>
                </select>
                <p className="text-xs text-text-secondary mt-1">
                  Default language for new users
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-t border-border pt-6">
            <h4 className="text-md font-medium text-text-primary mb-4 flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    Enable Notifications
                  </label>
                  <p className="text-xs text-text-secondary">
                    Allow system notifications
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableNotifications}
                    onChange={(e) =>
                      handleSettingsFormChange(
                        "enableNotifications",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    Email Notifications
                  </label>
                  <p className="text-xs text-text-secondary">
                    Send notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableEmailNotifications}
                    onChange={(e) =>
                      handleSettingsFormChange(
                        "enableEmailNotifications",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-text-primary">
                    SMS Notifications
                  </label>
                  <p className="text-xs text-text-secondary">
                    Send notifications via SMS
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.enableSMSNotifications}
                    onChange={(e) =>
                      handleSettingsFormChange(
                        "enableSMSNotifications",
                        e.target.checked
                      )
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <div className="border-t border-border pt-6">
              <h4 className="text-md font-medium text-text-primary mb-4 flex items-center">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Advanced Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Date Format
                  </label>
                  <select
                    value={settingsForm.dateFormat}
                    onChange={(e) =>
                      handleSettingsFormChange("dateFormat", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
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
                    value={settingsForm.timeFormat}
                    onChange={(e) =>
                      handleSettingsFormChange("timeFormat", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Theme
                  </label>
                  <select
                    value={settingsForm.theme}
                    onChange={(e) =>
                      handleSettingsFormChange("theme", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-800 text-text-primary"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => resetForm("settings")}
              className="px-4 py-2 border border-border text-text-primary rounded-md hover:bg-neutral-700"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save System Settings
            </button>
          </div>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            System Statistics
          </h3>
          <button
            onClick={refreshData}
            className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-800 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {systemStats.totalUsers || 0}
                </div>
                <div className="text-sm text-text-secondary">Total Users</div>
              </div>
              <User className="w-8 h-8 text-accent-primary" />
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {systemStats.totalStaff || 0}
                </div>
                <div className="text-sm text-text-secondary">Total Staff</div>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {systemStats.totalTables || 0}
                </div>
                <div className="text-sm text-text-secondary">Total Tables</div>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {systemStats.totalMenuItems || 0}
                </div>
                <div className="text-sm text-text-secondary">Menu Items</div>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-800 p-6 rounded-lg border border-border">
            <div className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              System Information
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Node Version:</span>
                <span className="text-text-primary font-mono">
                  {systemStats.nodeVersion}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Platform:</span>
                <span className="text-text-primary">
                  {systemStats.platform}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Uptime:</span>
                <span className="text-text-primary">
                  {systemStats.systemUptime
                    ? `${Math.floor(
                        systemStats.systemUptime / 3600
                      )}h ${Math.floor(
                        (systemStats.systemUptime % 3600) / 60
                      )}m`
                    : "0h 0m"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800 p-6 rounded-lg border border-border">
            <div className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Performance Metrics
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Memory Usage:</span>
                <span className="text-text-primary">
                  {systemStats.memoryUsage
                    ? `${Math.round(
                        systemStats.memoryUsage.heapUsed / 1024 / 1024
                      )}MB`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Heap Total:</span>
                <span className="text-text-primary">
                  {systemStats.memoryUsage
                    ? `${Math.round(
                        systemStats.memoryUsage.heapTotal / 1024 / 1024
                      )}MB`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">External:</span>
                <span className="text-text-primary">
                  {systemStats.memoryUsage
                    ? `${Math.round(
                        systemStats.memoryUsage.external / 1024 / 1024
                      )}MB`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="mt-6 bg-neutral-800 p-6 rounded-lg border border-border">
          <div className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            System Health
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-text-secondary">
                Database Connection
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-text-secondary">API Services</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-text-secondary">
                Authentication
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Backup & Restore
          </h3>
          <button
            onClick={refreshData}
            className="flex items-center px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>

        <div className="space-y-6">
          {/* Create Backup */}
          <div className="bg-neutral-800 p-6 rounded-lg border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-text-primary mb-2 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Create Backup
                </h4>
                <p className="text-sm text-text-secondary mb-4">
                  Create a comprehensive backup of your system data including
                  settings, users, configurations, and business data. This
                  backup can be used to restore your system in case of data
                  loss.
                </p>
                <div className="flex items-center space-x-4 text-sm text-text-secondary">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Settings & Configuration
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    User Data
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    Business Data
                  </div>
                </div>
              </div>
              <button
                onClick={handleBackup}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-accent-primary text-white rounded-md hover:bg-accent-primary-dark disabled:opacity-50 ml-4"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Create Backup
              </button>
            </div>
          </div>

          {/* Restore Data */}
          <div className="bg-neutral-800 p-6 rounded-lg border border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-text-primary mb-2 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Restore Data
                </h4>
                <p className="text-sm text-text-secondary mb-4">
                  Restore system data from a previous backup. This action will
                  overwrite current data and cannot be undone. Please ensure you
                  have a current backup before proceeding.
                </p>
                <div className="flex items-center space-x-4 text-sm text-text-secondary mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
                    Irreversible Action
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
                    Overwrites Current Data
                  </div>
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1 text-yellow-500" />
                    Requires Backup File
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowRestoreModal(true)}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 ml-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Restore Data
              </button>
            </div>
          </div>

          {/* Backup History */}
          <div className="bg-neutral-800 p-6 rounded-lg border border-border">
            <h4 className="text-lg font-medium text-text-primary mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Recent Backups
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-3 text-accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      System Backup
                    </p>
                    <p className="text-xs text-text-secondary">
                      Created 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-xs bg-neutral-600 text-text-primary rounded hover:bg-neutral-500">
                    Download
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-3 text-accent-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Weekly Backup
                    </p>
                    <p className="text-xs text-text-secondary">
                      Created 1 day ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-xs bg-neutral-600 text-text-primary rounded hover:bg-neutral-500">
                    Download
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                Restore System Data
              </h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">
                <strong>Warning:</strong> This action will overwrite all current
                data and cannot be undone. Make sure you have a current backup
                before proceeding.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Backup Data (JSON)
              </label>
              <textarea
                value={restoreData}
                onChange={(e) => setRestoreData(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary bg-neutral-700 text-text-primary"
                placeholder="Paste your backup JSON data here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 border border-border text-text-primary rounded-md hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRestore}
                disabled={loading || !restoreData.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Restore Data
              </button>
            </div>
          </div>
        </div>
      )}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-secondary">
            System configuration and user preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 text-green-300 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

        {/* Tab Description */}
        <div className="mt-2">
          <p className="text-sm text-text-secondary">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-accent-primary" />
            <span className="text-text-secondary">Loading settings...</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!loading && renderTabContent()}
    </div>
  );
};

export default Settings;
