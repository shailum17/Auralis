/**
 * Community Service
 * Handles community forum data using authentic user profiles
 */

import { User } from '@/types/auth';
import { DynamicProfileService } from './dynamic-profile-service';

export interface CommunityPost {
    id: string;
    title: string;
    content: string;
    authorId: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    likes: number;
    replies: number;
    views: number;
    isLiked: boolean;
    isPinned: boolean;
    isSolved: boolean;
    isAnonymous: boolean;
    lastReply?: {
        authorId: string;
        timestamp: string;
    };
}

export interface CommunityReply {
    id: string;
    postId: string;
    content: string;
    authorId: string;
    createdAt: string;
    likes: number;
    isLiked: boolean;
    isHelpful: boolean;
    isSolution: boolean;
}

export interface CommunityStats {
    totalPosts: number;
    totalUsers: number;
    activeToday: number;
    onlineNow: number;
    postsThisWeek: number;
}

export interface CategoryStats {
    id: string;
    name: string;
    icon: string;
    count: number;
    color: string;
}

export interface AdminReport {
    id: string;
    type: 'spam' | 'harassment' | 'inappropriate' | 'off-topic' | 'other';
    postId: string;
    postTitle: string;
    reporterId: string;
    reporterName: string;
    reason: string;
    createdAt: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
    assignedTo?: string;
    resolution?: string;
}

export interface AdminAction {
    id: string;
    type: 'post_deleted' | 'post_pinned' | 'post_unpinned' | 'user_warned' | 'user_banned' | 'user_unbanned' | 'report_resolved';
    performedBy: string;
    targetId: string; // postId or userId
    targetType: 'post' | 'user' | 'report';
    reason: string;
    details: string;
    createdAt: string;
}

export interface UserManagement {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'MODERATOR' | 'ADMIN';
    status: 'active' | 'warned' | 'suspended' | 'banned';
    joinedAt: string;
    lastActive: string;
    postsCount: number;
    repliesCount: number;
    reportsCount: number;
    warningsCount: number;
}

export class CommunityService {
    // In-memory storage for demo purposes
    private static posts: CommunityPost[] = [];
    private static replies: CommunityReply[] = [];
    private static userLikes: Map<string, Set<string>> = new Map(); // userId -> Set of postIds
    private static userReplyLikes: Map<string, Set<string>> = new Map(); // userId -> Set of replyIds
    private static reports: AdminReport[] = [];
    private static adminActions: AdminAction[] = [];
    private static users: Map<string, UserManagement> = new Map(); // userId -> UserManagement
    private static initialized = false;

    // Initialize with a welcome post
    private static initialize() {
        if (this.initialized) return;

        // Create a welcome post
        const welcomePost: CommunityPost = {
            id: 'welcome-post-1',
            title: 'Welcome to the Student Community Forum! 🎉',
            content: `Hello and welcome to our student community forum!

This is a space where students can:
• Ask questions and get help with academic topics
• Share resources and study tips
• Connect with fellow students
• Discuss wellness and mental health
• Find study groups and collaboration opportunities
• Share career advice and internship opportunities

To get started:
1. Complete your profile to connect better with the community
2. Browse different categories to find topics that interest you
3. Create your first post or reply to existing discussions
4. Be respectful and follow our community guidelines

We're excited to have you here! Feel free to introduce yourself and let us know what you're studying.

Happy learning! 📚✨`,
            authorId: 'system',
            category: 'general',
            tags: ['welcome', 'introduction', 'community'],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            likes: 0,
            replies: 0,
            views: 0,
            isLiked: false,
            isPinned: true,
            isSolved: false,
            isAnonymous: false
        };

        this.posts.push(welcomePost);
        this.initialized = true;
    }

    /**
     * Get community statistics
     */
    static getCommunityStats(): CommunityStats {
        this.initialize();

        return {
            totalPosts: this.posts.length,
            totalUsers: 1, // Would be actual user count from database
            activeToday: 1, // Would be users active in last 24h
            onlineNow: 1, // Would be currently online users
            postsThisWeek: this.posts.filter(post =>
                new Date(post.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length
        };
    }

    /**
     * Get category statistics
     */
    static getCategoryStats(): CategoryStats[] {
        this.initialize();
        const categories = [
            { id: 'all', name: 'All Posts', icon: '📋', color: 'text-gray-600' },
            { id: 'general', name: 'General Discussion', icon: '💬', color: 'text-blue-600' },
            { id: 'academic', name: 'Academic Help', icon: '📚', color: 'text-green-600' },
            { id: 'wellness', name: 'Wellness & Mental Health', icon: '💚', color: 'text-emerald-600' },
            { id: 'career', name: 'Career & Internships', icon: '💼', color: 'text-purple-600' },
            { id: 'events', name: 'Events & Activities', icon: '🎉', color: 'text-orange-600' },
            { id: 'housing', name: 'Housing & Roommates', icon: '🏠', color: 'text-red-600' },
            { id: 'marketplace', name: 'Buy & Sell', icon: '🛒', color: 'text-yellow-600' },
            { id: 'tech', name: 'Tech & Programming', icon: '💻', color: 'text-indigo-600' },
            { id: 'social', name: 'Social & Meetups', icon: '👥', color: 'text-pink-600' }
        ];

        return categories.map(category => ({
            ...category,
            count: category.id === 'all'
                ? this.posts.length
                : this.posts.filter(post => post.category === category.id).length
        }));
    }

    /**
     * Get user's community stats
     */
    static getUserCommunityStats(userId: string) {
        const userPosts = this.posts.filter(post => post.authorId === userId);
        const userReplies = this.replies.filter(reply => reply.authorId === userId);
        const userLikes = Array.from(this.userLikes.values()).reduce((total, likes) => total + likes.size, 0);

        return {
            posts: userPosts.length,
            replies: userReplies.length,
            likes: userLikes,
            reputation: userPosts.length * 10 + userReplies.length * 5 + userLikes * 2 // Simple reputation calculation
        };
    }

    /**
     * Create a new post
     */
    static createPost(
        title: string,
        content: string,
        category: string,
        tags: string[],
        authorId: string,
        isAnonymous: boolean = false
    ): CommunityPost {
        const post: CommunityPost = {
            id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            title,
            content,
            authorId,
            category,
            tags,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            likes: 0,
            replies: 0,
            views: 0,
            isLiked: false,
            isPinned: false,
            isSolved: false,
            isAnonymous
        };

        this.posts.unshift(post); // Add to beginning for newest first

        // Update user activity (ensure user exists first)
        if (!this.users.has(authorId)) {
            // Create a basic user entry if it doesn't exist
            const basicUser: UserManagement = {
                id: authorId,
                name: 'Community Member',
                email: 'user@example.com',
                role: 'USER',
                status: 'active',
                joinedAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                postsCount: 0,
                repliesCount: 0,
                reportsCount: 0,
                warningsCount: 0
            };
            this.users.set(authorId, basicUser);
        }
        this.updateUserActivity(authorId, 'post');

        return post;
    }

    /**
     * Get posts with filtering and sorting
     */
    static getPosts(
        category: string = 'all',
        sortBy: string = 'recent',
        searchQuery: string = '',
        currentUserId?: string,
        limit: number = 20,
        offset: number = 0
    ): CommunityPost[] {
        this.initialize();

        let filteredPosts = [...this.posts];

        // Filter by category
        if (category !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Sort posts
        filteredPosts.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.likes - a.likes;
                case 'discussed':
                    return b.replies - a.replies;
                case 'helpful':
                    return b.views - a.views;
                case 'recent':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        // Add user-specific data
        if (currentUserId) {
            const userLikes = this.userLikes.get(currentUserId) || new Set();
            filteredPosts = filteredPosts.map(post => ({
                ...post,
                isLiked: userLikes.has(post.id)
            }));
        }

        // Apply pagination
        return filteredPosts.slice(offset, offset + limit);
    }

    /**
     * Get a single post by ID
     */
    static getPost(postId: string, currentUserId?: string): CommunityPost | null {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return null;

        // Increment view count
        post.views += 1;

        // Add user-specific data
        if (currentUserId) {
            const userLikes = this.userLikes.get(currentUserId) || new Set();
            return {
                ...post,
                isLiked: userLikes.has(post.id)
            };
        }

        return post;
    }

    /**
     * Like/unlike a post
     */
    static togglePostLike(postId: string, userId: string): boolean {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        const userLikes = this.userLikes.get(userId) || new Set();

        if (userLikes.has(postId)) {
            // Unlike
            userLikes.delete(postId);
            post.likes = Math.max(0, post.likes - 1);
        } else {
            // Like
            userLikes.add(postId);
            post.likes += 1;
        }

        this.userLikes.set(userId, userLikes);
        return userLikes.has(postId);
    }

    /**
     * Create a reply to a post
     */
    static createReply(
        postId: string,
        content: string,
        authorId: string
    ): CommunityReply | null {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return null;

        const reply: CommunityReply = {
            id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            postId,
            content,
            authorId,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false,
            isHelpful: false,
            isSolution: false
        };

        this.replies.push(reply);

        // Update post reply count and last reply
        post.replies += 1;
        post.lastReply = {
            authorId,
            timestamp: reply.createdAt
        };

        // Update user activity (ensure user exists first)
        if (!this.users.has(authorId)) {
            // Create a basic user entry if it doesn't exist
            const basicUser: UserManagement = {
                id: authorId,
                name: 'Community Member',
                email: 'user@example.com',
                role: 'USER',
                status: 'active',
                joinedAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                postsCount: 0,
                repliesCount: 0,
                reportsCount: 0,
                warningsCount: 0
            };
            this.users.set(authorId, basicUser);
        }
        this.updateUserActivity(authorId, 'reply');

        return reply;
    }

    /**
     * Get replies for a post
     */
    static getReplies(postId: string, currentUserId?: string): CommunityReply[] {
        let replies = this.replies.filter(reply => reply.postId === postId);

        // Add user-specific data
        if (currentUserId) {
            const userReplyLikes = this.userReplyLikes.get(currentUserId) || new Set();
            replies = replies.map(reply => ({
                ...reply,
                isLiked: userReplyLikes.has(reply.id)
            }));
        }

        // Sort by creation date (oldest first, but solutions first)
        replies.sort((a, b) => {
            if (a.isSolution && !b.isSolution) return -1;
            if (!a.isSolution && b.isSolution) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        return replies;
    }

    /**
     * Like/unlike a reply
     */
    static toggleReplyLike(replyId: string, userId: string): boolean {
        const reply = this.replies.find(r => r.id === replyId);
        if (!reply) return false;

        const userReplyLikes = this.userReplyLikes.get(userId) || new Set();

        if (userReplyLikes.has(replyId)) {
            // Unlike
            userReplyLikes.delete(replyId);
            reply.likes = Math.max(0, reply.likes - 1);
        } else {
            // Like
            userReplyLikes.add(replyId);
            reply.likes += 1;
        }

        this.userReplyLikes.set(userId, userReplyLikes);
        return userReplyLikes.has(replyId);
    }

    /**
     * Get trending topics based on recent activity
     */
    static getTrendingTopics(): Array<{ name: string; posts: number; trend: 'up' | 'stable' | 'down' }> {
        // In a real implementation, this would analyze recent post activity
        // For now, return empty array since we don't have enough data
        return [];
    }

    /**
     * Get user's notifications
     */
    static getUserNotifications(userId: string): Array<{
        id: string;
        type: 'reply' | 'like' | 'mention' | 'follow' | 'system';
        title: string;
        message: string;
        timestamp: string;
        isRead: boolean;
        actionUrl?: string;
    }> {
        // In a real implementation, this would fetch user's actual notifications
        // For now, return empty array
        return [];
    }

    /**
     * Check if user has admin/moderator permissions
     */
    static hasModeratorPermissions(user: User | null): boolean {
        return user?.role === 'ADMIN' || user?.role === 'MODERATOR';
    }

    /**
     * Get author information for display
     */
    static getAuthorInfo(authorId: string, isAnonymous: boolean = false): {
        id: string;
        name: string;
        reputation: number;
        isOnline: boolean;
    } {
        if (isAnonymous) {
            return {
                id: 'anonymous',
                name: 'Anonymous',
                reputation: 0,
                isOnline: false
            };
        }

        // Special case for system posts
        if (authorId === 'system') {
            return {
                id: 'system',
                name: 'Community Team',
                reputation: 1000,
                isOnline: true
            };
        }

        // Ensure user exists in our system
        if (!this.users.has(authorId)) {
            const basicUser: UserManagement = {
                id: authorId,
                name: 'Community Member',
                email: 'user@example.com',
                role: 'USER',
                status: 'active',
                joinedAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                postsCount: 0,
                repliesCount: 0,
                reportsCount: 0,
                warningsCount: 0
            };
            this.users.set(authorId, basicUser);
        }

        const stats = this.getUserCommunityStats(authorId);
        const userData = this.users.get(authorId)!;

        return {
            id: authorId,
            name: userData.name,
            reputation: stats.reputation,
            isOnline: Math.random() > 0.5 // Would be actual online status from real-time system
        };
    }

    /**
     * Initialize user in community system (call this when user first accesses community)
     */
    static initializeUser(user: User): void {
        if (!this.users.has(user.id)) {
            this.registerUser(user);
        }
    }

    /**
     * Create sample data for testing (development only)
     */
    static createSampleData(): void {
        if (this.posts.length > 1) return; // Don't create if we already have posts beyond welcome

        // Create a sample user for testing
        const sampleUser: UserManagement = {
            id: 'sample-user-1',
            name: 'John Doe',
            email: 'john.doe@university.edu',
            role: 'USER',
            status: 'active',
            joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            postsCount: 2,
            repliesCount: 5,
            reportsCount: 0,
            warningsCount: 0
        };
        this.users.set('sample-user-1', sampleUser);

        // Create sample posts
        const samplePosts: CommunityPost[] = [
            {
                id: 'sample-post-1',
                title: 'Need help with JavaScript async/await',
                content: 'I\'m having trouble understanding how async/await works in JavaScript. Can someone explain the difference between promises and async/await? I keep getting confused about when to use each approach.',
                authorId: 'sample-user-1',
                category: 'tech',
                tags: ['javascript', 'async', 'programming', 'help'],
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                likes: 8,
                replies: 3,
                views: 45,
                isLiked: false,
                isPinned: false,
                isSolved: false,
                isAnonymous: false
            },
            {
                id: 'sample-post-2',
                title: 'Study group for Calculus II - anyone interested?',
                content: 'Starting a study group for Calculus II this semester. We\'ll meet twice a week to work through problem sets and prepare for exams. All skill levels welcome! Message me if you\'re interested.',
                authorId: 'sample-user-1',
                category: 'academic',
                tags: ['study-group', 'calculus', 'math', 'collaboration'],
                createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                likes: 15,
                replies: 7,
                views: 89,
                isLiked: false,
                isPinned: false,
                isSolved: false,
                isAnonymous: false,
                lastReply: {
                    authorId: 'sample-user-1',
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
                }
            }
        ];

        // Add sample posts (but not at the beginning to keep welcome post first)
        samplePosts.forEach(post => {
            this.posts.push(post);
        });

        // Create sample replies
        const sampleReply: CommunityReply = {
            id: 'sample-reply-1',
            postId: 'sample-post-1',
            content: 'Great question! Async/await is basically syntactic sugar for promises. It makes asynchronous code look more like synchronous code, which is easier to read and debug.',
            authorId: 'sample-user-1',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 5,
            isLiked: false,
            isHelpful: true,
            isSolution: false
        };
        this.replies.push(sampleReply);
    }

    // ==================== ADMIN METHODS ====================

    /**
     * Get all posts for admin management
     */
    static getAdminPosts(
        status: 'all' | 'pinned' | 'reported' | 'deleted' = 'all',
        limit: number = 50,
        offset: number = 0
    ): CommunityPost[] {
        this.initialize();

        let filteredPosts = [...this.posts];

        // Filter by status
        switch (status) {
            case 'pinned':
                filteredPosts = filteredPosts.filter(post => post.isPinned);
                break;
            case 'reported':
                const reportedPostIds = this.reports.map(report => report.postId);
                filteredPosts = filteredPosts.filter(post => reportedPostIds.includes(post.id));
                break;
            // 'all' and 'deleted' would need additional implementation
        }

        // Sort by creation date (newest first)
        filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filteredPosts.slice(offset, offset + limit);
    }

    /**
     * Pin/unpin a post
     */
    static togglePostPin(postId: string, adminId: string): boolean {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        post.isPinned = !post.isPinned;

        // Log admin action
        this.logAdminAction({
            type: post.isPinned ? 'post_pinned' : 'post_unpinned',
            performedBy: adminId,
            targetId: postId,
            targetType: 'post',
            reason: 'Admin action',
            details: `Post "${post.title}" ${post.isPinned ? 'pinned' : 'unpinned'}`
        });

        return post.isPinned;
    }

    /**
     * Delete a post
     */
    static deletePost(postId: string, adminId: string, reason: string): boolean {
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return false;

        const post = this.posts[postIndex];

        // Remove post
        this.posts.splice(postIndex, 1);

        // Remove associated replies
        this.replies = this.replies.filter(reply => reply.postId !== postId);

        // Log admin action
        this.logAdminAction({
            type: 'post_deleted',
            performedBy: adminId,
            targetId: postId,
            targetType: 'post',
            reason,
            details: `Post "${post.title}" deleted`
        });

        return true;
    }

    /**
     * Create a report
     */
    static createReport(
        postId: string,
        reporterId: string,
        reporterName: string,
        type: AdminReport['type'],
        reason: string
    ): AdminReport {
        const post = this.posts.find(p => p.id === postId);
        if (!post) throw new Error('Post not found');

        const report: AdminReport = {
            id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type,
            postId,
            postTitle: post.title,
            reporterId,
            reporterName,
            reason,
            createdAt: new Date().toISOString(),
            status: 'pending'
        };

        this.reports.push(report);
        return report;
    }

    /**
     * Get all reports
     */
    static getReports(
        status: AdminReport['status'] | 'all' = 'all',
        limit: number = 50,
        offset: number = 0
    ): AdminReport[] {
        let filteredReports = [...this.reports];

        if (status !== 'all') {
            filteredReports = filteredReports.filter(report => report.status === status);
        }

        // Sort by creation date (newest first)
        filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return filteredReports.slice(offset, offset + limit);
    }

    /**
     * Update report status
     */
    static updateReportStatus(
        reportId: string,
        status: AdminReport['status'],
        adminId: string,
        resolution?: string
    ): boolean {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return false;

        report.status = status;
        report.assignedTo = adminId;
        if (resolution) {
            report.resolution = resolution;
        }

        // Log admin action
        this.logAdminAction({
            type: 'report_resolved',
            performedBy: adminId,
            targetId: reportId,
            targetType: 'report',
            reason: 'Report status updated',
            details: `Report ${reportId} marked as ${status}`
        });

        return true;
    }

    /**
     * Get admin actions log
     */
    static getAdminActions(limit: number = 50, offset: number = 0): AdminAction[] {
        return this.adminActions
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(offset, offset + limit);
    }

    /**
     * Log an admin action
     */
    private static logAdminAction(action: Omit<AdminAction, 'id' | 'createdAt'>): void {
        const adminAction: AdminAction = {
            ...action,
            id: `action-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString()
        };

        this.adminActions.push(adminAction);
    }

    /**
     * Get user management data
     */
    static getUsers(
        status: UserManagement['status'] | 'all' = 'all',
        limit: number = 50,
        offset: number = 0
    ): UserManagement[] {
        let users = Array.from(this.users.values());

        if (status !== 'all') {
            users = users.filter(user => user.status === status);
        }

        // Sort by join date (newest first)
        users.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

        return users.slice(offset, offset + limit);
    }

    /**
     * Update user status
     */
    static updateUserStatus(
        userId: string,
        status: UserManagement['status'],
        adminId: string,
        reason: string
    ): boolean {
        const user = this.users.get(userId);
        if (!user) return false;

        const oldStatus = user.status;
        user.status = status;

        // Log admin action
        let actionType: AdminAction['type'];
        switch (status) {
            case 'banned':
                actionType = 'user_banned';
                break;
            case 'active':
                actionType = oldStatus === 'banned' ? 'user_unbanned' : 'user_warned';
                break;
            default:
                actionType = 'user_warned';
        }

        this.logAdminAction({
            type: actionType,
            performedBy: adminId,
            targetId: userId,
            targetType: 'user',
            reason,
            details: `User ${user.name} status changed from ${oldStatus} to ${status}`
        });

        return true;
    }

    /**
     * Get admin dashboard statistics
     */
    static getAdminStats(): {
        totalPosts: number;
        totalUsers: number;
        pendingReports: number;
        resolvedReports: number;
        activeUsers: number;
        bannedUsers: number;
        postsThisWeek: number;
        reportsThisWeek: number;
    } {
        this.initialize();

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        return {
            totalPosts: this.posts.length,
            totalUsers: this.users.size,
            pendingReports: this.reports.filter(r => r.status === 'pending').length,
            resolvedReports: this.reports.filter(r => r.status === 'resolved').length,
            activeUsers: Array.from(this.users.values()).filter(u => u.status === 'active').length,
            bannedUsers: Array.from(this.users.values()).filter(u => u.status === 'banned').length,
            postsThisWeek: this.posts.filter(p => new Date(p.createdAt) > weekAgo).length,
            reportsThisWeek: this.reports.filter(r => new Date(r.createdAt) > weekAgo).length
        };
    }

    /**
     * Register a user (for demo purposes)
     */
    static registerUser(user: User): void {
        const userManagement: UserManagement = {
            id: user.id,
            name: user.fullName || user.username || user.email.split('@')[0],
            email: user.email,
            role: user.role,
            status: 'active',
            joinedAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            lastActive: new Date().toISOString(),
            postsCount: 0,
            repliesCount: 0,
            reportsCount: 0,
            warningsCount: 0
        };

        this.users.set(user.id, userManagement);
    }

    /**
     * Update user activity stats
     */
    static updateUserActivity(userId: string, type: 'post' | 'reply'): void {
        const user = this.users.get(userId);
        if (!user) return;

        user.lastActive = new Date().toISOString();

        if (type === 'post') {
            user.postsCount += 1;
        } else if (type === 'reply') {
            user.repliesCount += 1;
        }
    }
}