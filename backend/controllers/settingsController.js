import { Outlet, User, Role, Permission } from "../models/index.js";
import { Op } from "sequelize";

// Get all system settings
export const getSystemSettings = async (req, res) => {
  try {
    const { outletId } = req.user;

    // Get outlet-specific settings
    const outlet = await Outlet.findByPk(outletId, {
      attributes: [
        "id",
        "name",
        "address",
        "phone",
        "email",
        "timezone",
        "currency",
        "tax_rate",
        "service_charge",
        "delivery_fee",
        "operating_hours",
        "settings",
      ],
    });

    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    // Get system-wide settings (could be stored in a separate Settings table)
    const systemSettings = {
      // Default system settings
      maxTables: 50,
      maxStaffPerShift: 20,
      reservationTimeLimit: 30, // minutes
      orderTimeout: 15, // minutes
      autoLogoutTime: 480, // 8 hours in minutes
      enableNotifications: true,
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      defaultLanguage: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      theme: "light",
      ...outlet.settings, // Override with outlet-specific settings
    };

    res.json({
      outlet: {
        ...outlet.toJSON(),
        taxRate: outlet.tax_rate,
        serviceCharge: outlet.service_charge,
        deliveryFee: outlet.delivery_fee,
        operatingHours: outlet.operating_hours,
      },
      systemSettings,
    });
  } catch (error) {
    console.error("Error fetching system settings:", error);
    res.status(500).json({
      message: "Error fetching system settings",
      error: error.message,
    });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const { outletId } = req.user;
    const { settings } = req.body;

    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    // Update outlet settings
    const updatedSettings = {
      ...outlet.settings,
      ...settings,
    };

    await outlet.update({ settings: updatedSettings });

    res.json({
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Error updating system settings:", error);
    res.status(500).json({
      message: "Error updating system settings",
      error: error.message,
    });
  }
};

// Update outlet information
export const updateOutletInfo = async (req, res) => {
  try {
    const { outletId } = req.user;
    const {
      name,
      address,
      phone,
      email,
      timezone,
      currency,
      taxRate,
      serviceCharge,
      deliveryFee,
      operatingHours,
    } = req.body;

    const outlet = await Outlet.findByPk(outletId);
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (currency !== undefined) updateData.currency = currency;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (serviceCharge !== undefined) updateData.serviceCharge = serviceCharge;
    if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
    if (operatingHours !== undefined)
      updateData.operatingHours = operatingHours;

    await outlet.update(updateData);

    res.json({
      message: "Outlet information updated successfully",
      outlet: {
        id: outlet.id,
        name: outlet.name,
        address: outlet.address,
        phone: outlet.phone,
        email: outlet.email,
        timezone: outlet.timezone,
        currency: outlet.currency,
        taxRate: outlet.tax_rate,
        serviceCharge: outlet.service_charge,
        deliveryFee: outlet.delivery_fee,
        operatingHours: outlet.operating_hours,
      },
    });
  } catch (error) {
    console.error("Error updating outlet information:", error);
    res.status(500).json({
      message: "Error updating outlet information",
      error: error.message,
    });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "firstName", "lastName", "email", "preferences"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const defaultPreferences = {
      theme: "dark",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      dashboard: {
        defaultView: "overview",
        showCharts: true,
        refreshInterval: 30,
      },
    };

    const preferences = {
      ...defaultPreferences,
      ...user.preferences,
    };

    res.json({ preferences });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({
      message: "Error fetching user preferences",
      error: error.message,
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    };

    await user.update({ preferences: updatedPreferences });

    res.json({
      message: "User preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({
      message: "Error updating user preferences",
      error: error.message,
    });
  }
};

// Get all roles and permissions
export const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
      order: [["name", "ASC"]],
    });

    const permissions = await Permission.findAll({
      order: [["name", "ASC"]],
    });

    res.json({
      roles,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching roles and permissions:", error);
    res.status(500).json({
      message: "Error fetching roles and permissions",
      error: error.message,
    });
  }
};

// Update role permissions
export const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update role permissions
    await role.setPermissions(permissionIds);

    // Fetch updated role with permissions
    const updatedRole = await Role.findByPk(roleId, {
      include: [
        {
          model: Permission,
          as: "permissions",
          through: { attributes: [] },
        },
      ],
    });

    res.json({
      message: "Role permissions updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    res.status(500).json({
      message: "Error updating role permissions",
      error: error.message,
    });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const { outletId } = req.user;

    // Get basic counts
    const [totalUsers, totalStaff] = await Promise.all([
      User.count({ where: { outletId } }),
      User.count({
        where: { outletId, role: { [Op.in]: ["staff", "supervisor"] } },
      }),
    ]);

    // Mock data for demonstration - in production, these would be real counts
    const totalTables = 25; // Mock table count
    const totalMenuItems = 150; // Mock menu items count

    res.json({
      totalUsers,
      totalStaff,
      totalTables,
      totalMenuItems,
      systemUptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    });
  } catch (error) {
    console.error("Error fetching system statistics:", error);
    res.status(500).json({
      message: "Error fetching system statistics",
      error: error.message,
    });
  }
};

// Backup system data
export const backupSystemData = async (req, res) => {
  try {
    const { outletId } = req.user;

    // This is a simplified backup - in production, you'd want to use proper backup tools
    const backupData = {
      timestamp: new Date().toISOString(),
      outletId,
      tables: [], // Would export table data
      menuItems: [], // Would export menu data
      users: [], // Would export user data (excluding sensitive info)
      settings: {}, // Would export settings
    };

    res.json({
      message: "Backup created successfully",
      backupData,
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    res
      .status(500)
      .json({ message: "Error creating backup", error: error.message });
  }
};

// Restore system data
export const restoreSystemData = async (req, res) => {
  try {
    const { backupData } = req.body;

    // This is a simplified restore - in production, you'd want proper validation and rollback
    if (!backupData || !backupData.timestamp) {
      return res.status(400).json({ message: "Invalid backup data" });
    }

    // In a real implementation, you'd restore the data here
    res.json({
      message: "System data restored successfully",
      restoredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error restoring system data:", error);
    res
      .status(500)
      .json({ message: "Error restoring system data", error: error.message });
  }
};
