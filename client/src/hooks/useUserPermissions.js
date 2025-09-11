import { useSelector } from "react-redux";
import { selectCurrentUser, selectUserRole } from "../store/slices/authSlice";

/**
 * Custom hook for user permissions and role-based access control
 * @returns {Object} User permissions and utility functions
 */
export const useUserPermissions = () => {
  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);

  // Check if user has a specific role
  const isRole = (role) => {
    return userRole === role;
  };

  // Check if user has any of the specified roles
  const isAnyRole = (roles) => {
    return Array.isArray(roles) ? roles.includes(userRole) : roles === userRole;
  };

  // Check if user is admin (org_admin or general_manager)
  const isAdmin = () => {
    return isAnyRole(["org_admin", "general_manager"]);
  };

  // Check if user can manage departments
  const canManageDepartments = () => {
    return isRole("org_admin");
  };

  // Check if user can manage staff
  const canManageStaff = () => {
    return isAnyRole(["org_admin", "general_manager", "supervisor"]);
  };

  // Check if user can view staff
  const canViewStaff = () => {
    return isAnyRole(["org_admin", "general_manager", "supervisor", "staff"]);
  };

  return {
    user,
    userRole,
    isRole,
    isAnyRole,
    isAdmin,
    canManageDepartments,
    canManageStaff,
    canViewStaff,
  };
};
