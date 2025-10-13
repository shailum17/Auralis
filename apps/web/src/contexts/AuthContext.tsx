'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

// Define role hierarchy and permissions
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  // User management permissions
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USER_ROLES = 'manage_user_roles',
  
  // Content moderation permissions
  VIEW_CONTENT = 'view_content',
  MODERATE_CONTENT = 'moderate_content',
  DELETE_CONTENT = 'delete_content',
  
  // System administration permissions
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SYSTEM = 'manage_system',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SECURITY = 'manage_security',
  
  // Community management permissions
  MANAGE_EVENTS = 'manage_events',
  SEND_ANNOUNCEMENTS = 'send_announcements',
  MANAGE_CHALLENGES = 'manage_challenges'
}

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [],
  [UserRole.MODERATOR]: [
    Permission.VIEW_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.VIEW_USERS
  ],
  [UserRole.ADMIN]: [
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_CONTENT,
    Permission.MODERATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_EVENTS,
    Permission.SEND_ANNOUNCEMENTS,
    Permission.MANAGE_CHALLENGES
  ],
  [UserRole.SUPER_ADMIN]: Object.values(Permission)
};

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  emailVerified: boolean;
  permissions?: Permission[];
  mfaEnabled?: boolean;
  
  // Personal Information (only if provided by user)
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
  
  // Academic Information (only if provided by user)
  academicInfo?: {
    institution?: string;
    major?: string;
    year?: number;
    courses?: string[];
    gpa?: number;
    graduationYear?: number;
  };
  
  // Settings (only if configured by user)
  privacySettings?: {
    allowDirectMessages?: boolean;
    showOnlineStatus?: boolean;
    allowProfileViewing?: boolean;
    dataCollection?: boolean;
  };
  
  wellnessSettings?: {
    trackMood?: boolean;
    trackStress?: boolean;
    shareWellnessData?: boolean;
    crisisAlertsEnabled?: boolean;
    allowWellnessInsights?: boolean;
  };
  
  preferences?: {
    feedAlgorithm?: string;
    privacyLevel?: string;
    theme?: string;
    language?: string;
    timezone?: string;
    notifications?: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      messageNotifications?: boolean;
      postReactions?: boolean;
      commentReplies?: boolean;
      studyGroupInvites?: boolean;
      sessionReminders?: boolean;
      wellnessAlerts?: boolean;
      moderationActions?: boolean;
      systemAnnouncements?: boolean;
    };
  };
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastActive?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
  // Role and permission checking utilities
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  canAccessAdminPanel: () => boolean;
}

// Helper function to get permissions for a role
function getUserPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (accessToken && storedUser) {
        try {
          // You can add a /me endpoint call here to verify the token with the backend
          // For now, we'll trust the stored data for simplicity
          const parsedUser: User = JSON.parse(storedUser);
          
          // Ensure user has proper permissions based on role
          const enhancedUser = {
            ...parsedUser,
            permissions: parsedUser.permissions || getUserPermissions(parsedUser.role)
          };
          
          setUser(enhancedUser);
          setIsAuthenticated(true);
          apiClient.setToken(accessToken);
        } catch (error) {
          console.error("Failed to parse user data from localStorage", error);
          // Clear invalid data
          logout();
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    // Ensure user has proper role and permissions
    const enhancedUserData = {
      ...userData,
      permissions: userData.permissions || getUserPermissions(userData.role)
    };
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(enhancedUserData));
    apiClient.setToken(accessToken);
    setUser(enhancedUserData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    apiClient.setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Role and permission checking utilities
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const userPermissions = user.permissions || getUserPermissions(user.role);
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  };

  const isModerator = (): boolean => {
    return user?.role === UserRole.MODERATOR || isAdmin();
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdmin() || isModerator();
  };

  // Update user data in context and localStorage
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Refresh user data from server
  const refreshUserData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !user) return;

    try {
      const response = await apiClient.getUserProfile(accessToken);
      if (response.success && response.data) {
        const enhancedUser = {
          ...response.data,
          permissions: response.data.permissions || getUserPermissions(response.data.role)
        };
        setUser(enhancedUser);
        localStorage.setItem('user', JSON.stringify(enhancedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    refreshUserData,
    hasRole,
    hasPermission,
    hasAnyPermission,
    isAdmin,
    isModerator,
    canAccessAdminPanel,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}