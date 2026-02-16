'use client';

import React from 'react';
import { useData } from '@/contexts/DataContext';
import PivotTableWidget from '@/components/widgets/PivotTableWidget';
import PivotChartWidget from '@/components/widgets/PivotChartWidget';
import GlobalFilterBar from '@/components/filters/GlobalFilterBar';

export default function DashboardCanvas() {
  const { currentDashboard, allData, addWidget, updateWidget, removeWidget } = useData();

  if (!currentDashboard) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-lg font-medium text-gray-500">No dashboard selected</p>
          <p className="text-sm mt-1">Create a new dashboard to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GlobalFilterBar />

      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200">
        <button
          onClick={() => addWidget('pivot-table')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Add Pivot Table
        </button>
        <button
          onClick={() => addWidget('pivot-chart')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Add Pivot Chart
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {currentDashboard.widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium">No widgets yet</p>
              <p className="text-xs mt-1">Click &quot;Add Pivot Table&quot; or &quot;Add Pivot Chart&quot; to begin</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentDashboard.widgets.map(widget => (
              <div key={widget.id} className="h-[450px]">
                {widget.type === 'pivot-table' ? (
                  <PivotTableWidget
                    widget={widget}
                    data={allData}
                    filters={currentDashboard.filters}
                    onUpdate={updateWidget}
                    onRemove={() => removeWidget(widget.id)}
                  />
                ) : (
                  <PivotChartWidget
                    widget={widget}
                    data={allData}
                    filters={currentDashboard.filters}
                    onUpdate={updateWidget}
                    onRemove={() => removeWidget(widget.id)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
