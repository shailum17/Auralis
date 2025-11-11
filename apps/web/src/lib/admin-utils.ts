/**
 * Admin utilities for checking permissions and managing admin access
 */

import { User } from '@/types/auth';

/**
 * Check if user has admin permissions
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

/**
 * Check if user has moderator or admin permissions
 */
export function isModerator(user: User | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'MODERATOR';
}

/**
 * Check if user can access admin dashboard
 */
export function canAccessAdminDashboard(user: User | null): boolean {
  return isAdmin(user) || isModerator(user);
}

/**
 * Get admin user display info
 */
export function getAdminDisplayInfo(user: User | null) {
  if (!user) return null;
  
  return {
    name: user.fullName || user.username || 'Admin',
    role: user.role,
    isAdmin: isAdmin(user),
    isModerator: isModerator(user),
    canAccessDashboard: canAccessAdminDashboard(user)
  };
}

/**
 * Admin session validation
 */
export function validateAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const { sessionStorage } = await import('./session-storage');
    const user = sessionStorage.getUser();
    const tokens = sessionStorage.getTokens();
    const accessToken = tokens?.accessToken;
    
    if (!user || !accessToken) return false;
    return canAccessAdminDashboard(user);
  } catch (error) {
    console.error('Failed to validate admin session:', error);
    return false;
  }
}

/**
 * Redirect to admin login if not authenticated
 */
export function requireAdminAuth(): boolean {
  const isValid = validateAdminSession();
  
  if (!isValid && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
    return false;
  }
  
  return isValid;
}