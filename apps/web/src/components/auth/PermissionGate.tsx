'use client';

import { useAuth, Permission, UserRole } from '@/contexts/AuthContext';
import { hasComponentAccess } from '@/lib/auth-utils';
import { ReactNode } from 'react';

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission[];
  requireAny?: boolean;
  fallback?: ReactNode;
  role?: UserRole;
}

export function PermissionGate({ 
  children, 
  permissions, 
  requireAny = false, 
  fallback = null,
  role 
}: PermissionGateProps) {
  const { user } = useAuth();

  // Check role requirement first if specified
  if (role && user?.role !== role) {
    // Allow higher roles to access lower role components
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.MODERATOR]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.SUPER_ADMIN]: 3
    };
    
    const userRoleLevel = user?.role ? roleHierarchy[user.role] : -1;
    const requiredRoleLevel = roleHierarchy[role];
    
    if (userRoleLevel < requiredRoleLevel) {
      return <>{fallback}</>;
    }
  }

  // Check permissions
  const hasAccess = hasComponentAccess(
    user?.role,
    user?.permissions,
    permissions,
    requireAny
  );

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate 
      permissions={[]} 
      role={UserRole.ADMIN} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function ModeratorOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate 
      permissions={[]} 
      role={UserRole.MODERATOR} 
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function UserManagementAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate 
      permissions={[Permission.VIEW_USERS, Permission.EDIT_USERS]} 
      requireAny={true}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function ContentModerationAccess({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGate 
      permissions={[Permission.VIEW_CONTENT, Permission.MODERATE_CONTENT]} 
      requireAny={true}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}