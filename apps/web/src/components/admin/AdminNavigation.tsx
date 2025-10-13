'use client';

import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate, AdminOnly } from '@/components/auth/PermissionGate';
import { Permission } from '@/contexts/AuthContext';

export function AdminNavigation() {
  const { canAccessAdminPanel } = usePermissions();

  if (!canAccessAdminPanel()) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link 
              href="/admin" 
              className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Dashboard
            </Link>

            <PermissionGate permissions={[Permission.VIEW_USERS]}>
              <Link 
                href="/admin/users" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                User Management
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[Permission.VIEW_CONTENT]}>
              <Link 
                href="/admin/content" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Content Moderation
              </Link>
            </PermissionGate>

            <PermissionGate permissions={[Permission.VIEW_ANALYTICS]}>
              <Link 
                href="/admin/analytics" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Analytics
              </Link>
            </PermissionGate>

            <AdminOnly>
              <Link 
                href="/admin/system" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                System Settings
              </Link>
            </AdminOnly>

            <PermissionGate permissions={[Permission.VIEW_AUDIT_LOGS]}>
              <Link 
                href="/admin/audit" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Audit Logs
              </Link>
            </PermissionGate>
          </div>
        </div>
      </div>
    </nav>
  );
}