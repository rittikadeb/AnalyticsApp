'use client';

import React, { useMemo, useState } from 'react';
import { Widget, PivotTableConfig, DragItem, ValueField, GlobalFilter } from '@/types';
import { computePivotTable, applyFilters } from '@/lib/pivot-engine';
import DropZone from '@/components/dnd/DropZone';
import ValueDropZone from '@/components/dnd/ValueDropZone';

interface PivotTableWidgetProps {
  widget: Widget;
  data: Record<string, string | number | null>[];
  filters: GlobalFilter[];
  onUpdate: (widget: Widget) => void;
  onRemove: () => void;
}

export default function PivotTableWidget({ widget, data, filters, onUpdate, onRemove }: PivotTableWidgetProps) {
  const config = widget.config as PivotTableConfig;
  const [showConfig, setShowConfig] = useState(true);
  const [title, setTitle] = useState(widget.title);

  const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);
  const result = useMemo(() => computePivotTable(filteredData, config), [filteredData, config]);

  const updateConfig = (newConfig: Partial<PivotTableConfig>) => {
    onUpdate({ ...widget, config: { ...config, ...newConfig } });
  };

  const handleTitleBlur = () => {
    if (title !== widget.title) {
      onUpdate({ ...widget, title });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="text-sm font-medium text-gray-800 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-1 -ml-1"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Toggle configuration"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 rounded"
            title="Remove widget"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 space-y-2">
          <DropZone
            label="Rows"
            accept={['dimension']}
            items={config.rows}
            onDrop={(item: DragItem) => updateConfig({ rows: [...config.rows, item.field] })}
            onRemove={(field: string) => updateConfig({ rows: config.rows.filter(r => r !== field) })}
          />
          <DropZone
            label="Columns"
            accept={['dimension']}
            items={config.columns}
            onDrop={(item: DragItem) => updateConfig({ columns: [...config.columns, item.field] })}
            onRemove={(field: string) => updateConfig({ columns: config.columns.filter(c => c !== field) })}
          />
          <ValueDropZone
            label="Values"
            items={config.values}
            onDrop={(item: DragItem) => updateConfig({
              values: [...config.values, { field: item.field, aggregation: 'sum' }]
            })}
            onRemove={(field: string) => updateConfig({ values: config.values.filter(v => v.field !== field) })}
            onChangeAggregation={(field: string, agg: ValueField['aggregation']) => updateConfig({
              values: config.values.map(v => v.field === field ? { ...v, aggregation: agg } : v)
            })}
          />
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        {result.headers.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Drag fields from data model to begin
          </div>
        ) : result.rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No results match the current filters
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                {result.headers.map((h, i) => (
                  <th key={i} className="text-left px-2 py-1.5 border-b border-gray-200 text-gray-600 font-medium text-xs whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-2 py-1 border-b border-gray-100 text-gray-700 whitespace-nowrap">
                      {typeof cell === 'number' ? cell.toLocaleString() : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
