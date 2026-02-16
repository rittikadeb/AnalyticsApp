'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Widget, PivotChartConfig, DragItem, ValueField, GlobalFilter } from '@/types';
import { computePivotChart, applyFilters } from '@/lib/pivot-engine';
import DropZone from '@/components/dnd/DropZone';
import ValueDropZone from '@/components/dnd/ValueDropZone';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const CHART_COLORS = [
  'rgba(59, 130, 246, 0.7)',
  'rgba(16, 185, 129, 0.7)',
  'rgba(245, 158, 11, 0.7)',
  'rgba(239, 68, 68, 0.7)',
  'rgba(139, 92, 246, 0.7)',
  'rgba(236, 72, 153, 0.7)',
  'rgba(20, 184, 166, 0.7)',
  'rgba(249, 115, 22, 0.7)',
];

interface PivotChartWidgetProps {
  widget: Widget;
  data: Record<string, string | number | null>[];
  filters: GlobalFilter[];
  onUpdate: (widget: Widget) => void;
  onRemove: () => void;
}

export default function PivotChartWidget({ widget, data, filters, onUpdate, onRemove }: PivotChartWidgetProps) {
  const config = widget.config as PivotChartConfig;
  const [showConfig, setShowConfig] = useState(true);
  const [title, setTitle] = useState(widget.title);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => applyFilters(data, filters), [data, filters]);
  const result = useMemo(() => computePivotChart(filteredData, config), [filteredData, config]);

  const updateConfig = (newConfig: Partial<PivotChartConfig>) => {
    onUpdate({ ...widget, config: { ...config, ...newConfig } });
  };

  const handleTitleBlur = () => {
    if (title !== widget.title) {
      onUpdate({ ...widget, title });
    }
  };

  const chartData = useMemo(() => {
    if (config.chartType === 'pie') {
      return {
        labels: result.labels,
        datasets: result.datasets.map(ds => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: result.labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
          borderWidth: 1,
        })),
      };
    }

    return {
      labels: result.labels,
      datasets: result.datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
        borderColor: CHART_COLORS[i % CHART_COLORS.length],
        borderWidth: config.chartType === 'line' ? 2 : 1,
        fill: false,
        tension: 0.3,
      })),
    };
  }, [result, config.chartType]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, font: { size: 11 } } },
    },
    scales: config.chartType === 'pie' ? {} : {
      x: { ticks: { font: { size: 10 }, maxRotation: 45 } },
      y: { ticks: { font: { size: 10 } }, beginAtZero: true },
    },
  };

  const ChartComponent = config.chartType === 'line' ? Line : config.chartType === 'pie' ? Pie : Bar;

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
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Chart Type</label>
            <div className="flex gap-1">
              {(['bar', 'column', 'line', 'pie'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => updateConfig({ chartType: type === 'column' ? 'bar' : type })}
                  className={`px-2 py-1 text-xs rounded ${
                    (config.chartType === type || (type === 'column' && config.chartType === 'bar'))
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <DropZone
            label="Dimensions"
            accept={['dimension']}
            items={config.dimensions}
            onDrop={(item: DragItem) => updateConfig({ dimensions: [...config.dimensions, item.field] })}
            onRemove={(field: string) => updateConfig({ dimensions: config.dimensions.filter(d => d !== field) })}
          />
          <ValueDropZone
            label="Measures"
            items={config.measures}
            onDrop={(item: DragItem) => updateConfig({
              measures: [...config.measures, { field: item.field, aggregation: 'sum' }]
            })}
            onRemove={(field: string) => updateConfig({ measures: config.measures.filter(m => m.field !== field) })}
            onChangeAggregation={(field: string, agg: ValueField['aggregation']) => updateConfig({
              measures: config.measures.map(m => m.field === field ? { ...m, aggregation: agg } : m)
            })}
          />
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-hidden p-3">
        {result.labels.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            {config.dimensions.length === 0 && config.measures.length === 0
              ? 'Drag fields from data model to begin'
              : 'No results match the current filters'}
          </div>
        ) : (
          <div className="h-full">
            <ChartComponent data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
