import { PERMISSIONS } from "../store/slices/authSlice";

// Route configuration with permissions and layout requirements
export const ROUTES = {
  // Public routes (no authentication required)
  LOGIN: {
    path: "/login",
    permission: null,
    layout: "auth",
    title: "Login",
  },
  REGISTER: {
    path: "/register",
    permission: null,
    layout: "auth",
    title: "Register",
  },

  // Protected routes (authentication required)
  DASHBOARD: {
    path: "/dashboard",
    permission: PERMISSIONS.VIEW_DASHBOARD,
    layout: "main",
    title: "Dashboard",
    icon: "Home",
  },

  // User Management (Admin only)
  USER_MANAGEMENT: {
    path: "/users",
    permission: PERMISSIONS.VIEW_USERS,
    layout: "main",
    title: "User Management",
    icon: "Shield",
    adminOnly: true,
  },

  // Outlet Management
  OUTLET_MANAGEMENT: {
    path: "/outlets",
    permission: PERMISSIONS.VIEW_OUTLETS,
    layout: "main",
    title: "Outlet Management",
    icon: "Building2",
  },

  // Order Management
  ORDERS: {
    path: "/orders",
    permission: PERMISSIONS.VIEW_ORDERS,
    layout: "main",
    title: "Orders",
    icon: "ShoppingCart",
  },

  // Reservation Management
  RESERVATIONS: {
    path: "/reservations",
    permission: PERMISSIONS.VIEW_RESERVATIONS,
    layout: "main",
    title: "Reservations",
    icon: "Calendar",
  },

  // Guest Management
  GUESTS: {
    path: "/guests",
    permission: PERMISSIONS.VIEW_GUESTS,
    layout: "main",
    title: "Guests",
    icon: "UserCheck",
  },

  // Inventory Management
  INVENTORY: {
    path: "/inventory",
    permission: PERMISSIONS.VIEW_INVENTORY,
    layout: "main",
    title: "Inventory",
    icon: "Package",
  },

  // Tables Management
  TABLES: {
    path: "/tables",
    permission: PERMISSIONS.VIEW_DASHBOARD,
    layout: "main",
    title: "Tables",
    icon: "Calendar",
  },

  // Menu Management
  MENU: {
    path: "/menu",
    permission: PERMISSIONS.VIEW_MENU,
    layout: "main",
    title: "Menu Management",
    icon: "Utensils",
  },

  // Staff Management
  STAFF: {
    path: "/staff",
    permission: PERMISSIONS.VIEW_STAFF,
    layout: "main",
    title: "Staff Management",
    icon: "Users",
  },

  // Shift Management
  SHIFTS: {
    path: "/shifts",
    permission: PERMISSIONS.MANAGE_SHIFTS,
    layout: "main",
    title: "Shift Management",
    icon: "Clock",
  },

  // Support Tickets
  TICKETS: {
    path: "/tickets",
    permission: PERMISSIONS.VIEW_TICKETS,
    layout: "main",
    title: "Support Tickets",
    icon: "Ticket",
  },

  // Events & Promotions
  EVENTS: {
    path: "/events",
    permission: PERMISSIONS.VIEW_ANALYTICS,
    layout: "main",
    title: "Events & Promotions",
    icon: "CalendarDays",
  },

  // Reports & Analytics
  REPORTS: {
    path: "/reports",
    permission: PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    layout: "main",
    title: "Reports & Analytics",
    icon: "BarChart3",
  },

  // Settings
  SETTINGS: {
    path: "/settings",
    permission: PERMISSIONS.VIEW_DASHBOARD,
    layout: "main",
    title: "Settings",
    icon: "Settings",
  },

  // User Profile
  USER_PROFILE: {
    path: "/profile",
    permission: PERMISSIONS.VIEW_DASHBOARD,
    layout: "main",
    title: "User Profile",
    icon: "User",
  },

  // Access Control (Admin only)
  ACCESS_CONTROL: {
    path: "/access-control",
    permission: PERMISSIONS.VIEW_USERS,
    layout: "main",
    title: "Access Control",
    icon: "Shield",
    adminOnly: true,
  },
};

// Helper function to get routes by layout
export const getRoutesByLayout = (layout) => {
  return Object.values(ROUTES).filter((route) => route.layout === layout);
};

// Helper function to get main navigation routes
export const getMainNavigationRoutes = () => {
  return Object.values(ROUTES).filter(
    (route) =>
      route.layout === "main" &&
      route.path !== "/profile" &&
      route.path !== "/access-control"
  );
};

// Helper function to check if user has access to a route
export const hasRouteAccess = (route, user, permissions) => {
  // Super user has access to everything
  if (user?.role === "org_admin") {
    return true;
  }

  // Check admin-only restriction
  if (route.adminOnly && user?.role !== "org_admin") {
    return false;
  }

  // Check permission
  if (route.permission) {
    return permissions?.includes(route.permission);
  }

  return true;
};

// Helper function to get accessible routes for a user
export const getAccessibleRoutes = (user, permissions) => {
  return Object.values(ROUTES).filter((route) =>
    hasRouteAccess(route, user, permissions)
  );
};
