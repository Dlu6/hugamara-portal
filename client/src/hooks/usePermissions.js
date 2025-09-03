import { useSelector } from 'react-redux';
import { 
  selectUserPermissions, 
  selectUserRole
} from '../store/slices/authSlice';

export const usePermissions = () => {
  const permissions = useSelector(selectUserPermissions);
  const role = useSelector(selectUserRole);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(permission => permissions.includes(permission));
  };

  const isRole = (targetRole) => {
    return role === targetRole;
  };

  const isAnyRole = (roles) => {
    return roles.includes(role);
  };

  return {
    permissions,
    role,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAnyRole
  };
};
