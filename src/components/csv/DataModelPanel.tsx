'use client';

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';

export default function DataModelPanel() {
  const { csvFiles, removeCSVFile } = useData();
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFile = (fileId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, field: string, type: string, sourceFile: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      field,
      columnType: type,
      sourceFile,
      type: type === 'number' ? 'measure' : 'dimension',
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'number': return '#';
      case 'date': return 'D';
      default: return 'A';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'number': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400';
      case 'date': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400';
      default: return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
    }
  };

  if (csvFiles.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <p>No data imported yet.</p>
        <p className="mt-1">Upload CSV files to see your data model.</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-2">Data Model</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 px-2 mb-3">Drag fields to widgets or filter bar</p>
      {csvFiles.map(file => (
        <div key={file.id} className="mb-2">
          <div
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer group"
            onClick={() => toggleFile(file.id)}
          >
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${expandedFiles.has(file.id) ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
            <button
              onClick={e => { e.stopPropagation(); removeCSVFile(file.id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          {expandedFiles.has(file.id) && (
            <div className="ml-5 space-y-0.5">
              {file.columns.map(col => (
                <div
                  key={col.name}
                  draggable
                  onDragStart={e => handleDragStart(e, col.name, col.type, file.name)}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded cursor-grab active:cursor-grabbing text-sm"
                >
                  <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-mono ${typeColor(col.type)}`}>
                    {typeIcon(col.type)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 truncate">{col.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
