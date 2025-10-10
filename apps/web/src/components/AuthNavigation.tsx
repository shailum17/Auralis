'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthNavigation() {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Auralis</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-900"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {!expanded ? (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:items-center md:justify-start md:ml-16 md:mr-auto md:space-x-10 md:flex">
            <Link href="/#features" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Features
            </Link>
            <Link href="/#wellness" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Wellness
            </Link>
            <Link href="/#community" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Community
            </Link>
            <Link href="/resources" className="text-base font-medium text-gray-900 transition-all duration-200 hover:text-blue-600">
              Resources
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <div className="relative">
                <div className="absolute inset-0 z-0 rounded-lg blur-[10px] opacity-60 pointer-events-none"
                  style={{
                    background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                  }}
                />
                <Link
                  href="/auth/signup"
                  className="relative inline-flex items-center justify-center px-6 py-2 sm:py-2.5 text-base font-semibold text-black transition-all duration-200 bg-white rounded-lg sm:text-sm hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 z-10"
                  role="button"
                >
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {expanded && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-1 pt-8 pb-4">
              <div className="grid gap-y-6">
                <Link href="/#features" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Features
                </Link>
                <Link href="/#wellness" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Wellness
                </Link>
                <Link href="/#community" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Community
                </Link>
                <Link href="/resources" className="flex items-center text-base font-medium text-gray-900 transition-all duration-200">
                  Resources
                </Link>
                <Link
                  href="/auth/signin"
                  className="flex items-center text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <div className="relative">
                  <div className="absolute inset-0 z-0 rounded-lg blur-[40px] opacity-60 pointer-events-none"
                    style={{
                      background: 'linear-gradient(120deg, #ff80b5 0%, #ffd700 25%, #ffb347 45%, #7fffd4 65%, #80bfff 85%, #ffd700 100%)',
                    }}
                  />
                  <Link
                    href="/auth/signup"
                    className="relative inline-flex items-center justify-center px-6 py-2 text-base font-semibold leading-7 text-black transition-all duration-200 bg-white border border-transparent rounded-lg hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 z-10"
                    role="button"
                  >
                    Join Community
                  </Link>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </div>
    </nav>
  );
}