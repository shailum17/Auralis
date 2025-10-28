'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityService } from '@/lib/community-service';
import PostManagement from '@/components/community/admin/PostManagement';
import ReportsManagement from '@/components/community/admin/ReportsManagement';
import UserManagement from '@/components/community/admin/UserManagement';
import AdminSettings from '@/components/community/admin/AdminSettings';

export default function CommunityAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Check if user has admin/moderator permissions
  useEffect(() => {
    if (!user) {
      // Redirect to admin login if no user
      router.push('/admin/login');
      return;
    }
    
    if (!CommunityService.hasModeratorPermissions(user)) {
      // Redirect to admin login if not admin/moderator
      router.push('/admin/login');
      return;
    }
    
    setLoading(false);
  }, [user, router]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'posts', name: 'Manage Posts', icon: '📝' },
    { id: 'users', name: 'Manage Users', icon: '👥' },
    { id: 'reports', name: 'Reports', icon: '🚨' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ];

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    activeToday: 0,
    pendingReports: 0,
    resolvedReports: 0,
    activeUsers: 0,
    bannedUsers: 0,
    postsThisWeek: 0,
    reportsThisWeek: 0
  });

  // Load admin stats
  useEffect(() => {
    if (!user || !CommunityService.hasModeratorPermissions(user)) return;
    
    const loadStats = () => {
      const adminStats = CommunityService.getAdminStats();
      setStats({
        ...adminStats,
        activeToday: adminStats.activeUsers // Map activeUsers to activeToday for compatibility
      });
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Get recent reports and activity
  const recentReports = CommunityService.getReports('pending', 5, 0);
  const recentActivity = CommunityService.getAdminActions(5, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Community Administration</h1>
                <p className="text-gray-600 mt-1">Manage and moderate the community forum</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'ADMIN' ? '👑 Administrator' : '🛡️ Moderator'}
                </span>
                <button
                  onClick={() => router.push('/community')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Back to Forum
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {Object.entries(stats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
              >
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{tab.icon}</span>
                      <span>{tab.name}</span>
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Reports */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                    {recentReports.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">No reports to review</p>
                        <p className="text-xs text-gray-500">Community is behaving well!</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {recentReports.map((report) => (
                            <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{report.type}</h4>
                                  <p className="text-sm text-gray-600">{report.postTitle}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  report.status === 'reviewing' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {report.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Reported by {report.reporterName}</span>
                                <span>{new Date(report.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View All Reports →
                        </button>
                      </>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">No recent activity</p>
                        <p className="text-xs text-gray-500">Moderation actions will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{activity.type.replace('_', ' ')}</span>
                                <span className="text-gray-600"> - {activity.details}</span>
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                <span>by Admin</span>
                                <span>•</span>
                                <span>{new Date(activity.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'posts' && <PostManagement />}

              {activeTab === 'users' && <UserManagement />}

              {activeTab === 'reports' && <ReportsManagement />}

              {activeTab === 'settings' && <AdminSettings />}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}