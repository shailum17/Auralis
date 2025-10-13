import { UserRole, Permission } from '@/contexts/AuthContext';

// Route protection utilities
export interface RouteProtectionConfig {
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  requireAny?: boolean; // If true, user needs ANY of the permissions, otherwise ALL
}

export function checkRouteAccess(
  userRole: UserRole | undefined,
  userPermissions: Permission[] | undefined,
  config: RouteProtectionConfig
): boolean {
  // If no protection config, allow access
  if (!config.requiredRole && !config.requiredPermissions?.length) {
    return true;
  }

  // Check role requirement
  if (config.requiredRole && userRole !== config.requiredRole) {
    // Allow higher roles to access lower role routes
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.MODERATOR]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPER_ADMIN]: 3
    };
    
    const userRoleLevel = userRole ? roleHierarchy[userRole] : -1;
    const requiredRoleLevel = roleHierarchy[config.requiredRole];
    
    if (userRoleLevel < requiredRoleLevel) {
      return false;
    }
  }

  // Check permission requirements
  if (config.requiredPermissions?.length && userPermissions) {
    if (config.requireAny) {
      // User needs ANY of the required permissions
      return config.requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
    } else {
      // User needs ALL of the required permissions
      return config.requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
    }
  }

  return true;
}

// Admin route configurations
export const ADMIN_ROUTES: Record<string, RouteProtectionConfig> = {
  '/admin': {
    requiredRole: UserRole.MODERATOR
  },
  '/admin/users': {
    requiredPermissions: [Permission.VIEW_USERS]
  },
  '/admin/users/manage': {
    requiredPermissions: [Permission.EDIT_USERS, Permission.DELETE_USERS],
    requireAny: true
  },
  '/admin/content': {
    requiredPermissions: [Permission.VIEW_CONTENT]
  },
  '/admin/content/moderate': {
    requiredPermissions: [Permission.MODERATE_CONTENT]
  },
  '/admin/analytics': {
    requiredPermissions: [Permission.VIEW_ANALYTICS]
  },
  '/admin/system': {
    requiredPermissions: [Permission.MANAGE_SYSTEM]
  },
  '/admin/security': {
    requiredPermissions: [Permission.MANAGE_SECURITY]
  },
  '/admin/audit': {
    requiredPermissions: [Permission.VIEW_AUDIT_LOGS]
  }
};

// Component-level permission checking
export function hasComponentAccess(
  userRole: UserRole | undefined,
  userPermissions: Permission[] | undefined,
  requiredPermissions: Permission[],
  requireAny: boolean = false
): boolean {
  if (!userPermissions || !requiredPermissions.length) {
    return false;
  }

  if (requireAny) {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  } else {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }
}

// Role display utilities
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    [UserRole.USER]: 'User',
    [UserRole.MODERATOR]: 'Moderator',
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.SUPER_ADMIN]: 'Super Administrator'
  };
  
  return roleNames[role] || 'Unknown';
}

export function getRoleBadgeColor(role: UserRole): string {
  const roleColors = {
    [UserRole.USER]: 'bg-gray-100 text-gray-800',
    [UserRole.MODERATOR]: 'bg-blue-100 text-blue-800',
    [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
    [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800'
  };
  
  return roleColors[role] || 'bg-gray-100 text-gray-800';
}