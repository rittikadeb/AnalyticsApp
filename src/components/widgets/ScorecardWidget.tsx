'use client';

import React, { useMemo, useState } from 'react';
import { Widget, ScorecardConfig, DragItem, GlobalFilter, ValueField } from '@/types';
import { applyFilters } from '@/lib/pivot-engine';

interface ScorecardWidgetProps {
  widget: Widget;
  data: Record<string, string | number | null>[];
  filters: GlobalFilter[];
  onUpdate: (widget: Widget) => void;
  onRemove: () => void;
}

const AGGREGATIONS: ValueField['aggregation'][] = ['sum', 'count', 'average', 'min', 'max', 'unique'];

function computeScorecard(data: Record<string, string | number | null>[], config: ScorecardConfig): number | null {
  if (!config.field) return null;
  const values = data
    .map(r => r[config.field])
    .filter((v): v is number => v != null && !isNaN(Number(v)))
    .map(Number);
  if (values.length === 0) return null;

  switch (config.aggregation) {
    case 'sum': return values.reduce((a, b) => a + b, 0);
    case 'count': return values.length;
    case 'average': return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min': return Math.min(...values);
    case 'max': return Math.max(...values);
    case 'unique': return new Set(values).size;
    default: return values.reduce((a, b) => a + b, 0);
  }
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return (Math.round(n * 100) / 100).toLocaleString();
}

export default function ScorecardWidget({ widget, data, filters, onUpdate, onRemove }: ScorecardWidgetProps) {
  const config = widget.config as ScorecardConfig;
  const [showConfig, setShowConfig] = useState(!config.field);
  const [title, setTitle] = useState(widget.title);
  const [dragOver, setDragOver] = useState(false);

  const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);
  const value = useMemo(() => computeScorecard(filteredData, config), [filteredData, config]);

  const updateConfig = (newConfig: Partial<ScorecardConfig>) => {
    onUpdate({ ...widget, config: { ...config, ...newConfig } });
  };

  const handleTitleBlur = () => {
    if (title !== widget.title) onUpdate({ ...widget, title });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const item: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
      updateConfig({ field: item.field, label: item.field });
      if (widget.title === 'New Scorecard') {
        onUpdate({ ...widget, title: item.field, config: { ...config, field: item.field, label: item.field } });
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            title="Toggle configuration"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 rounded" title="Remove widget">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Aggregation</label>
            <div className="flex flex-wrap gap-1">
              {AGGREGATIONS.map(agg => (
                <button
                  key={agg}
                  onClick={() => updateConfig({ aggregation: agg })}
                  className={`px-2 py-1 text-xs rounded ${
                    config.aggregation === agg
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {agg.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Field</label>
            <div
              className={`min-h-[36px] border rounded-lg p-1.5 flex items-center transition-colors ${
                dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {config.field ? (
                <span className="inline-flex items-center gap-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300 shadow-sm">
                  {config.field}
                  <button onClick={() => updateConfig({ field: '', label: '' })} className="text-gray-400 hover:text-red-500">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ) : (
                <span className="text-xs text-gray-400">Drop a field here</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className="flex-1 flex items-center justify-center p-4"
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {!config.field ? (
          <div className={`text-center ${dragOver ? 'text-blue-400' : 'text-gray-400'}`}>
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-sm">Drop a field to create a scorecard</p>
          </div>
        ) : value === null ? (
          <p className="text-sm text-gray-400">No data</p>
        ) : (
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(value)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {config.aggregation.toUpperCase()} of {config.field}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
