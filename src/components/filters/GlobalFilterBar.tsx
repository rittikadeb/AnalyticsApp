'use client';

import React, { useState } from 'react';
import { DragItem, GlobalFilter } from '@/types';
import { useData } from '@/contexts/DataContext';
import { v4 as uuidv4 } from 'uuid';

export default function GlobalFilterBar() {
  const { currentDashboard, allData, allColumns, addFilter, updateFilter, removeFilter } = useData();
  const [dragOver, setDragOver] = useState(false);
  const filters = currentDashboard?.filters || [];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const data: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
      const filter: GlobalFilter = {
        id: uuidv4(),
        field: data.field,
        operator: data.columnType === 'number' ? 'gt' : 'contains',
        value: '',
      };
      addFilter(filter);
    } catch {
      // ignore
    }
  };

  const getUniqueValues = (field: string): string[] => {
    const values = new Set<string>();
    allData.forEach(row => {
      const val = row[field];
      if (val != null) values.add(String(val));
    });
    return Array.from(values).sort().slice(0, 100);
  };

  const getFieldType = (field: string): string => {
    const col = allColumns.find(c => c.name === field);
    return col?.type || 'string';
  };

  if (filters.length === 0) {
    return (
      <div
        className={`border-b px-4 py-2 flex items-center gap-2 transition-colors ${
          dragOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-xs text-gray-400">Drag fields here to add global filters</span>
      </div>
    );
  }

  return (
    <div
      className={`border-b px-4 py-2 flex flex-wrap items-center gap-2 transition-colors ${
        dragOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
      }`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      {filters.map(filter => {
        const fieldType = getFieldType(filter.field);
        const uniqueValues = fieldType === 'string' ? getUniqueValues(filter.field) : [];

        return (
          <div key={filter.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs shadow-sm">
            <span className="font-medium text-gray-700">{filter.field}</span>
            <select
              value={filter.operator}
              onChange={e => updateFilter({ ...filter, operator: e.target.value as GlobalFilter['operator'] })}
              className="bg-transparent border-none text-blue-600 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="gt">greater than</option>
              <option value="lt">less than</option>
            </select>
            {fieldType === 'string' && filter.operator === 'equals' ? (
              <select
                value={String(filter.value)}
                onChange={e => updateFilter({ ...filter, value: e.target.value })}
                className="border border-gray-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700"
              >
                <option value="">Select...</option>
                {uniqueValues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                type={fieldType === 'number' ? 'number' : 'text'}
                value={String(filter.value)}
                onChange={e => updateFilter({ ...filter, value: fieldType === 'number' ? Number(e.target.value) : e.target.value })}
                placeholder="value"
                className="border border-gray-200 rounded px-1 py-0.5 w-24 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700"
              />
            )}
            <button
              onClick={() => removeFilter(filter.id)}
              className="text-gray-400 hover:text-red-500 ml-0.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
