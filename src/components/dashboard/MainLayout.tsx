'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Sidebar from './Sidebar';
import DashboardCanvas from './DashboardCanvas';

export default function MainLayout() {
  const { dark, toggle } = useTheme();

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Top bar with theme toggle */}
      <div className="h-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-4 shrink-0">
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {dark ? 'Light' : 'Dark'}
        </button>
      </div>
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <DashboardCanvas />
      </div>
    </div>
  );
}
