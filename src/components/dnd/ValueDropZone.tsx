'use client';

import React, { useState } from 'react';
import { DragItem, ValueField } from '@/types';

interface ValueDropZoneProps {
  label: string;
  items: ValueField[];
  onDrop: (item: DragItem) => void;
  onRemove: (field: string) => void;
  onChangeAggregation: (field: string, aggregation: ValueField['aggregation']) => void;
  className?: string;
}

const AGGREGATIONS: ValueField['aggregation'][] = ['sum', 'count', 'average', 'min', 'max'];

export default function ValueDropZone({ label, items, onDrop, onRemove, onChangeAggregation, className = '' }: ValueDropZoneProps) {
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
      if (!items.find(i => i.field === data.field)) {
        onDrop(data);
      }
    } catch {
      // ignore
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
          <span className="text-xs text-gray-400 px-1">Drop value fields here</span>
        )}
        {items.map(item => (
          <span
            key={item.field}
            className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700 shadow-sm"
          >
            <select
              value={item.aggregation}
              onChange={e => onChangeAggregation(item.field, e.target.value as ValueField['aggregation'])}
              className="bg-transparent border-none text-xs font-medium text-blue-600 cursor-pointer focus:outline-none pr-0"
            >
              {AGGREGATIONS.map(agg => (
                <option key={agg} value={agg}>{agg.toUpperCase()}</option>
              ))}
            </select>
            <span>({item.field})</span>
            <button
              onClick={() => onRemove(item.field)}
              className="text-gray-400 hover:text-red-500 ml-0.5"
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
