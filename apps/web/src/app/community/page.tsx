'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ForumHeader from '../../components/community/ForumHeader';
import ForumSidebar from '../../components/community/ForumSidebar';
import PostList from '../../components/community/PostList';
import CreatePostModal from '../../components/community/CreatePostModal';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityService } from '@/lib/community-service';

export default function CommunityPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize user in community system
  useEffect(() => {
    if (user) {
      CommunityService.initializeUser(user);
    }
  }, [user]);

  const handlePostCreated = () => {
    // Trigger a refresh of the post list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Forum Header */}
        <ForumHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onCreatePost={() => setShowCreateModal(true)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ForumSidebar 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <PostList 
                category={selectedCategory}
                sortBy={sortBy}
                searchQuery={searchQuery}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreateModal && (
          <CreatePostModal 
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </DashboardLayout>
  );
}