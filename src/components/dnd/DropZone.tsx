'use client';

import React, { useState } from 'react';
import { DragItem } from '@/types';

interface DropZoneProps {
  label: string;
  accept?: ('dimension' | 'measure')[];
  items: string[];
  onDrop: (item: DragItem) => void;
  onRemove: (field: string) => void;
  className?: string;
}

export default function DropZone({ label, accept, items, onDrop, onRemove, className = '' }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const data: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
      if (accept && !accept.includes(data.type)) return;
      if (!items.includes(data.field)) {
        onDrop(data);
      }
    } catch {
      // ignore invalid drops
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div
        className={`min-h-[40px] border rounded-lg p-1.5 flex flex-wrap gap-1 transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {items.length === 0 && (
          <span className="text-xs text-gray-400 px-1">Drop fields here</span>
        )}
        {items.map(field => (
          <span
            key={field}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700 shadow-sm"
          >
            {field}
            <button
              onClick={() => onRemove(field)}
              className="text-gray-400 hover:text-red-500"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
