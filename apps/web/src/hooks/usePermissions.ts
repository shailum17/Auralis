'use client';

import { useAuth, Permission, UserRole } from '@/contexts/AuthContext';
import { hasComponentAccess } from '@/lib/auth-utils';

export function usePermissions() {
  const { user, hasRole, hasPermission, hasAnyPermission, isAdmin, isModerator, canAccessAdminPanel } = useAuth();

  const checkPermissions = (permissions: Permission[], requireAny: boolean = false) => {
    return hasComponentAccess(user?.role, user?.permissions, permissions, requireAny);
  };

  const canManageUsers = () => {
    return hasAnyPermission([Permission.VIEW_USERS, Permission.EDIT_USERS, Permission.DELETE_USERS]);
  };

  const canModerateContent = () => {
    return hasAnyPermission([Permission.VIEW_CONTENT, Permission.MODERATE_CONTENT, Permission.DELETE_CONTENT]);
  };

  const canViewAnalytics = () => {
    return hasPermission(Permission.VIEW_ANALYTICS);
  };

  const canManageSystem = () => {
    return hasPermission(Permission.MANAGE_SYSTEM);
  };

  const canViewAuditLogs = () => {
    return hasPermission(Permission.VIEW_AUDIT_LOGS);
  };

  const canManageSecurity = () => {
    return hasPermission(Permission.MANAGE_SECURITY);
  };

  const canManageEvents = () => {
    return hasPermission(Permission.MANAGE_EVENTS);
  };

  const canSendAnnouncements = () => {
    return hasPermission(Permission.SEND_ANNOUNCEMENTS);
  };

  const canManageChallenges = () => {
    return hasPermission(Permission.MANAGE_CHALLENGES);
  };

  return {
    // Basic auth info
    user,
    
    // Role checking
    hasRole,
    isAdmin,
    isModerator,
    canAccessAdminPanel,
    
    // Permission checking
    hasPermission,
    hasAnyPermission,
    checkPermissions,
    
    // Specific capability checks
    canManageUsers,
    canModerateContent,
    canViewAnalytics,
    canManageSystem,
    canViewAuditLogs,
    canManageSecurity,
    canManageEvents,
    canSendAnnouncements,
    canManageChallenges,
  };
}