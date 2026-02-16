'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import DataModelPanel from '@/components/csv/DataModelPanel';
import CSVUploader from '@/components/csv/CSVUploader';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dashboards, currentDashboard, createDashboard, selectDashboard, removeDashboard } = useData();
  const [showUploader, setShowUploader] = useState(false);
  const [showNewDashboard, setShowNewDashboard] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreateDashboard = () => {
    if (newName.trim()) {
      createDashboard(newName.trim());
      setNewName('');
      setShowNewDashboard(false);
    }
  };

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-800 text-sm">Analytics App</span>
          </div>
        </div>

        {/* Import button */}
        <div className="px-3 py-2">
          <button
            onClick={() => setShowUploader(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Data
          </button>
        </div>

        {/* Dashboards */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dashboards</h3>
            <button
              onClick={() => setShowNewDashboard(true)}
              className="text-gray-400 hover:text-blue-600"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {showNewDashboard && (
            <div className="flex gap-1 mb-2">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateDashboard()}
                placeholder="Dashboard name"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700"
              />
              <button
                onClick={handleCreateDashboard}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={() => { setShowNewDashboard(false); setNewName(''); }}
                className="px-1 text-xs text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            {dashboards.length === 0 && !showNewDashboard && (
              <p className="text-xs text-gray-400 px-2 py-1">No dashboards yet</p>
            )}
            {dashboards.map(db => (
              <div
                key={db.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer group ${
                  currentDashboard?.id === db.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => selectDashboard(db.id)}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="truncate flex-1">{db.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeDashboard(db.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Model */}
        <div className="flex-1 overflow-auto">
          <DataModelPanel />
        </div>

        {/* User footer */}
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showUploader && <CSVUploader onClose={() => setShowUploader(false)} />}
    </>
  );
}
