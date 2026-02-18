'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import DataModelPanel from '@/components/csv/DataModelPanel';
import CSVUploader from '@/components/csv/CSVUploader';
import { getSampleSalesData, getSampleMarketingData } from '@/lib/sample-data';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dashboards, currentDashboard, createDashboard, selectDashboard, removeDashboard, addCSVFile, csvFiles, exportDashboard, importDashboard } = useData();
  const [showUploader, setShowUploader] = useState(false);
  const [showNewDashboard, setShowNewDashboard] = useState(false);
  const [newName, setNewName] = useState('');
  const [importError, setImportError] = useState('');
  const importRef = useRef<HTMLInputElement>(null);

  const handleCreateDashboard = () => {
    if (newName.trim()) {
      createDashboard(newName.trim());
      setNewName('');
      setShowNewDashboard(false);
    }
  };

  const handleLoadSampleData = () => {
    addCSVFile(getSampleSalesData());
    addCSVFile(getSampleMarketingData());
  };

  const handleExport = () => {
    const json = exportDashboard();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDashboard?.name || 'dashboard'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importDashboard(ev.target?.result as string);
      if (!result.success) setImportError(result.error || 'Import failed');
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = '';
  };

  return (
    <>
      <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shrink-0">
        {/* Actions */}
        <div className="p-3 space-y-1.5">
          <button
            onClick={() => setShowUploader(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Import CSV
          </button>
          {csvFiles.length === 0 && (
            <button
              onClick={handleLoadSampleData}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              Load Sample Data
            </button>
          )}
        </div>

        {/* Dashboards */}
        <div className="px-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dashboards</h3>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => importRef.current?.click()}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                title="Import dashboard JSON"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </button>
              <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
              {currentDashboard && (
                <button
                  onClick={handleExport}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                  title="Export current dashboard as JSON"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
              )}
              <button
                onClick={() => setShowNewDashboard(true)}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                title="New dashboard"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
            </div>
          </div>

          {importError && (
            <div className="text-xs text-red-500 dark:text-red-400 px-2 py-1 mb-1 bg-red-50 dark:bg-red-950/30 rounded">{importError}</div>
          )}

          {showNewDashboard && (
            <div className="flex gap-1 mb-2">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateDashboard(); if (e.key === 'Escape') { setShowNewDashboard(false); setNewName(''); } }}
                placeholder="Dashboard name"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
              />
              <button onClick={handleCreateDashboard} className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">Add</button>
            </div>
          )}

          <div className="space-y-0.5 max-h-40 overflow-auto">
            {dashboards.length === 0 && !showNewDashboard && (
              <p className="text-xs text-gray-400 dark:text-gray-600 px-2 py-2 text-center">No dashboards yet</p>
            )}
            {dashboards.map(db => (
              <div
                key={db.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs cursor-pointer group transition-colors ${
                  currentDashboard?.id === db.id
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => selectDashboard(db.id)}
              >
                <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                <span className="truncate flex-1">{db.name}</span>
                <button
                  onClick={e => { e.stopPropagation(); removeDashboard(db.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800" />

        {/* Data Model */}
        <div className="flex-1 overflow-auto">
          <DataModelPanel />
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded" title="Sign out">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {showUploader && <CSVUploader onClose={() => setShowUploader(false)} />}
    </>
  );
}
