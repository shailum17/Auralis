'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { User, Edit, Bell, Palette, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDisplayName } from '@/lib/profile-utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: getDisplayName(user),
        username: user.username || user.email.split('@')[0],
        bio: user.bio || '',
        avatar: (user as any).avatar || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to save the profile data
    console.log('Profile saved:', profile);
    // You could show a success toast/message here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your profile, account, and notification settings.</p>
        </motion.div>

        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-x-5">
          <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <nav className="space-y-1">
              <a href="#" className="bg-gray-100 text-blue-600 group rounded-md px-3 py-2 flex items-center text-sm font-medium" aria-current="page">
                <User className="text-blue-500 group-hover:text-blue-600 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Profile</span>
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-900 hover:bg-gray-50 group rounded-md px-3 py-2 flex items-center text-sm font-medium">
                <Edit className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Account</span>
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-900 hover:bg-gray-50 group rounded-md px-3 py-2 flex items-center text-sm font-medium">
                <Bell className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Notifications</span>
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-900 hover:bg-gray-50 group rounded-md px-3 py-2 flex items-center text-sm font-medium">
                <Palette className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Appearance</span>
              </a>
              <a href="#" className="text-gray-900 hover:text-gray-900 hover:bg-gray-50 group rounded-md px-3 py-2 flex items-center text-sm font-medium">
                <Shield className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Privacy & Security</span>
              </a>
              <a href="/logout" className="text-gray-900 hover:text-gray-900 hover:bg-gray-50 group rounded-md px-3 py-2 flex items-center text-sm font-medium">
                <LogOut className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                <span className="truncate">Logout</span>
              </a>
            </nav>
          </aside>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9"
          >
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-2xl sm:overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-200">
                <div className="py-6 px-4 space-y-6 sm:p-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Public Profile</h3>
                    <p className="mt-1 text-sm text-gray-500">This information will be displayed publicly so be careful what you share.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Profile Photo */}
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                      <div className="mt-2 flex items-center space-x-5">
                        <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                          {profile.avatar ? (
                            <img className="h-full w-full object-cover" src={profile.avatar} alt="Profile" />
                          ) : (
                            <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                        </span>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Upload
                          </button>
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={profile.fullName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    {/* Username */}
                    <div className="col-span-3 sm:col-span-2">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <div className="mt-1 rounded-md shadow-sm flex">
                        <span className="bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 inline-flex items-center text-gray-500 sm:text-sm">
                          auralis.app/
                        </span>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={profile.username}
                          onChange={handleInputChange}
                          className="flex-1 block w-full min-w-0 border-gray-300 rounded-none rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="col-span-3">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        About
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          value={profile.bio}
                          onChange={handleInputChange}
                          className="shadow-sm block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="A brief description for your profile."
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-2xl">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}