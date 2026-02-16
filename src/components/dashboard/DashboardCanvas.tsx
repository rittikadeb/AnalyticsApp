'use client';

import React, { useState, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { Widget } from '@/types';
import PivotTableWidget from '@/components/widgets/PivotTableWidget';
import PivotChartWidget from '@/components/widgets/PivotChartWidget';
import ScorecardWidget from '@/components/widgets/ScorecardWidget';
import GlobalFilterBar from '@/components/filters/GlobalFilterBar';

function ResizableWrapper({ widget, onUpdate, children }: { widget: Widget; onUpdate: (w: Widget) => void; children: React.ReactNode }) {
  const [height, setHeight] = useState(widget.h);
  const [resizing, setResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
    const startY = e.clientY;
    const startH = height;

    const onMouseMove = (ev: MouseEvent) => {
      const newH = Math.max(150, startH + ev.clientY - startY);
      setHeight(newH);
    };

    const onMouseUp = (ev: MouseEvent) => {
      const newH = Math.max(150, startH + ev.clientY - startY);
      setHeight(newH);
      setResizing(false);
      onUpdate({ ...widget, h: newH });
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [height, widget, onUpdate]);

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <div className="h-full">{children}</div>
      <div
        onMouseDown={handleMouseDown}
        className={`absolute bottom-0 left-0 right-0 h-2 cursor-s-resize flex items-center justify-center group ${resizing ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} rounded-b-lg`}
      >
        <div className={`w-10 h-1 rounded-full ${resizing ? 'bg-blue-400' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400'}`} />
      </div>
    </div>
  );
}

export default function DashboardCanvas() {
  const { currentDashboard, allData, addWidget, updateWidget, removeWidget } = useData();

  if (!currentDashboard) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No dashboard selected</p>
          <p className="text-sm mt-1">Create a new dashboard to get started</p>
        </div>
      </div>
    );
  }

  const renderWidget = (widget: Widget) => {
    const props = {
      widget,
      data: allData,
      filters: currentDashboard.filters,
      onUpdate: updateWidget,
      onRemove: () => removeWidget(widget.id),
    };

    switch (widget.type) {
      case 'pivot-table': return <PivotTableWidget {...props} />;
      case 'pivot-chart': return <PivotChartWidget {...props} />;
      case 'scorecard': return <ScorecardWidget {...props} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GlobalFilterBar />

      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => addWidget('pivot-table')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Pivot Table
        </button>
        <button
          onClick={() => addWidget('pivot-chart')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Pivot Chart
        </button>
        <button
          onClick={() => addWidget('scorecard')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          Scorecard
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {currentDashboard.widgets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm font-medium">No widgets yet</p>
              <p className="text-xs mt-1">Add a Pivot Table, Pivot Chart, or Scorecard to begin</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {currentDashboard.widgets.map(widget => (
              <div key={widget.id}>
                <ResizableWrapper widget={widget} onUpdate={updateWidget}>
                  {renderWidget(widget)}
                </ResizableWrapper>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
