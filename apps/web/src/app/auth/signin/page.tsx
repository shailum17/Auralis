'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '@/components/AuthLayout';

const SignInPage = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEmailSignin = () => {
    setShowEmailForm(true);
  };

  const handleBackToOptions = () => {
    setShowEmailForm(false);
    setIsSignUp(false);
    setFormData({ name: '', email: '', password: '', confirmPassword: '', rememberMe: false, agreeToTerms: false });
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: '', email: '', password: '', confirmPassword: '', rememberMe: false, agreeToTerms: false });
  };

  const handleCreateAccount = () => {
    setShowEmailForm(true);
    setIsSignUp(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  // Animated Vector Component for Sign In
  const AnimatedVector = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex justify-center mb-8"
    >
      <div className="relative w-32 h-32">
        <motion.svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          className="absolute inset-0"
        >
          {/* Background Circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* Email Icon */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <rect x="32" y="45" width="64" height="40" rx="4" fill="none" stroke="url(#gradient2)" strokeWidth="2"/>
            <motion.path
              d="M32 49l32 20 32-20"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1, duration: 1 }}
            />
          </motion.g>

          {/* Floating Dots */}
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={i}
              cx={20 + i * 18}
              cy={20 + Math.sin(i) * 10}
              r="2"
              fill="url(#gradient3)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0.5, 1], 
                scale: [0, 1, 1.2, 1],
                y: [0, -5, 0, 5, 0]
              }}
              transition={{ 
                delay: 1.5 + i * 0.1, 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff80b5" />
              <stop offset="25%" stopColor="#ffd700" />
              <stop offset="50%" stopColor="#80bfff" />
              <stop offset="75%" stopColor="#7fffd4" />
              <stop offset="100%" stopColor="#ff80b5" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    </motion.div>
  );

  // Animated Vector Component for Sign Up
  const AnimatedSignUpVector = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex justify-center mb-8"
    >
      <div className="relative w-32 h-32">
        <motion.svg
          width="128"
          height="128"
          viewBox="0 0 128 128"
          className="absolute inset-0"
        >
          {/* Background Circle */}
          <motion.circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="url(#signupGradient1)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          
          {/* User Plus Icon */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Head */}
            <motion.circle
              cx="54"
              cy="48"
              r="8"
              fill="none"
              stroke="url(#signupGradient2)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
            {/* Body */}
            <motion.path
              d="M38 85c0-8.837 7.163-16 16-16s16 7.163 16 16"
              fill="none"
              stroke="url(#signupGradient2)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
            {/* Plus sign */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <line x1="80" y1="55" x2="92" y2="55" stroke="url(#signupGradient3)" strokeWidth="3" strokeLinecap="round"/>
              <line x1="86" y1="49" x2="86" y2="61" stroke="url(#signupGradient3)" strokeWidth="3" strokeLinecap="round"/>
            </motion.g>
          </motion.g>

          {/* Floating Stars */}
          {[...Array(8)].map((_, i) => (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0.7, 1], 
                scale: [0, 1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                delay: 1.8 + i * 0.1, 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <polygon
                points={`${25 + i * 12},${25 + Math.sin(i) * 15} ${25 + i * 12 + 3},${25 + Math.sin(i) * 15 + 3} ${25 + i * 12},${25 + Math.sin(i) * 15 + 6} ${25 + i * 12 - 3},${25 + Math.sin(i) * 15 + 3}`}
                fill="url(#signupGradient4)"
              />
            </motion.g>
          ))}

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="signupGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="25%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <linearGradient id="signupGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#0D9488" />
            </linearGradient>
            <linearGradient id="signupGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="signupGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#DB2777" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">A</span>
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Auralis
              </span>
            </Link>

            {/* Back to Home Button */}
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back to Home</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <AuthLayout>
      <div className="relative">
        {/* Gradient blur background */}
        <div className="absolute inset-0 z-0 rounded-3xl blur-[60px] opacity-40 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
          }}
        />
        
        <div className="relative bg-white rounded-3xl p-8 shadow-2xl z-10">
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              /* Main Sign In Options */
              <motion.div
                key="main-options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome to Rareblocks
                  </h1>
                  <p className="text-gray-600">
                    Sign in to grow your business fast
                  </p>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center mb-8">
                  <div className="flex space-x-1">
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Sign in with Facebook</span>
                  </motion.button>
                </div>

                {/* Or divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Email button */}
                <motion.button
                  onClick={handleEmailSignin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl border border-gray-200 transition-all mb-6"
                >
                  Sign in with Email
                </motion.button>

                {/* Create account link */}
                <div className="text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <button 
                    onClick={handleCreateAccount}
                    className="text-gray-900 font-semibold hover:underline"
                  >
                    Create a free account
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Email Sign In Form */
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back Button */}
                <motion.button
                  onClick={handleBackToOptions}
                  className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                  whileHover={{ x: -5 }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to options
                </motion.button>

                {/* Animated Vector */}
                {isSignUp ? <AnimatedSignUpVector /> : <AnimatedVector />}

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {isSignUp ? 'Create Your Account! ✨' : 'Welcome Back! 👋'}
                  </h1>
                  <p className="text-gray-600">
                    {isSignUp 
                      ? 'Join our community and start your journey today' 
                      : 'Enter your credentials to access your account'
                    }
                  </p>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field (Sign Up Only) */}
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required={isSignUp}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignUp ? 0.2 : 0.1 }}
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignUp ? 0.3 : 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                        Password
                      </label>
                      {!isSignUp && (
                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                          Forgot Password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Confirm Password Field (Sign Up Only) */}
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required={isSignUp}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Remember Me / Terms and Conditions */}
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignUp ? 0.5 : 0.3 }}
                  >
                    {!isSignUp ? (
                      <div className="flex items-center">
                        <input
                          id="rememberMe"
                          name="rememberMe"
                          type="checkbox"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                          Remember me for 30 days
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                          required={isSignUp}
                        />
                        <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                          I agree to the{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    )}
                  </motion.div>

                  {/* Sign In/Sign Up Button */}
                  <motion.button
                    type="submit"
                    className={`w-full ${isSignUp ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignUp ? 0.6 : 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </motion.button>

                  {/* Or divider */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: isSignUp ? 0.7 : 0.5 }}
                  >
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                  </motion.div>

                  {/* Social Login Options */}
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignUp ? 0.8 : 0.6 }}
                  >
                    <motion.button
                      type="button"
                      className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </motion.button>
                    <motion.button
                      type="button"
                      className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </motion.button>
                  </motion.div>
                </form>

                {/* Create account/Sign in toggle link */}
                <motion.div
                  className="text-center mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-gray-600">
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                  </span>
                  <button 
                    onClick={handleToggleSignUp}
                    className={`${isSignUp ? 'text-blue-600 hover:text-blue-500' : 'text-blue-600 hover:text-blue-500'} font-semibold`}
                  >
                    {isSignUp ? 'Sign in here' : 'Create a free account'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthLayout>
      </div>
    </div>
  );
};

export default SignInPage;