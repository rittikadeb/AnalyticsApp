'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CSVFile, Dashboard, Widget, GlobalFilter, ColumnDef } from '@/types';
import { getCSVFiles, saveCSVFile, deleteCSVFile as storageDeleteCSV, getDashboards, saveDashboard, deleteDashboard as storageDeleteDashboard } from '@/lib/storage';
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  csvFiles: CSVFile[];
  dashboards: Dashboard[];
  currentDashboard: Dashboard | null;
  allColumns: ColumnDef[];
  allData: Record<string, string | number | null>[];
  addCSVFile: (file: CSVFile) => void;
  removeCSVFile: (fileId: string) => void;
  createDashboard: (name: string) => Dashboard;
  selectDashboard: (id: string) => void;
  updateDashboard: (dashboard: Dashboard) => void;
  removeDashboard: (id: string) => void;
  addWidget: (type: 'pivot-table' | 'pivot-chart' | 'scorecard') => void;
  updateWidget: (widget: Widget) => void;
  removeWidget: (widgetId: string) => void;
  addFilter: (filter: GlobalFilter) => void;
  updateFilter: (filter: GlobalFilter) => void;
  removeFilter: (filterId: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [csvFiles, setCsvFiles] = useState<CSVFile[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (user) {
      const files = getCSVFiles(user.id);
      setCsvFiles(files);
      const dbs = getDashboards(user.id);
      setDashboards(dbs);
      if (dbs.length > 0) {
        setCurrentDashboard(dbs[0]);
      } else {
        setCurrentDashboard(null);
      }
    } else {
      setCsvFiles([]);
      setDashboards([]);
      setCurrentDashboard(null);
    }
  }, [user]);

  const allColumns = csvFiles.flatMap(f => f.columns);
  const allData = csvFiles.flatMap(f => f.data);

  const addCSVFile = useCallback((file: CSVFile) => {
    if (!user) return;
    saveCSVFile(user.id, file);
    setCsvFiles(prev => [...prev, file]);
  }, [user]);

  const removeCSVFile = useCallback((fileId: string) => {
    if (!user) return;
    storageDeleteCSV(user.id, fileId);
    setCsvFiles(prev => prev.filter(f => f.id !== fileId));
  }, [user]);

  const createDashboard = useCallback((name: string): Dashboard => {
    const dashboard: Dashboard = {
      id: uuidv4(),
      userId: user!.id,
      name,
      widgets: [],
      filters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDashboard(user!.id, dashboard);
    setDashboards(prev => [...prev, dashboard]);
    setCurrentDashboard(dashboard);
    return dashboard;
  }, [user]);

  const selectDashboard = useCallback((id: string) => {
    setDashboards(prev => {
      const db = prev.find(d => d.id === id);
      if (db) setCurrentDashboard(db);
      return prev;
    });
  }, []);

  const updateDashboard = useCallback((dashboard: Dashboard) => {
    if (!user) return;
    dashboard.updatedAt = new Date().toISOString();
    saveDashboard(user.id, dashboard);
    setDashboards(prev => prev.map(d => d.id === dashboard.id ? dashboard : d));
    if (currentDashboard?.id === dashboard.id) {
      setCurrentDashboard(dashboard);
    }
  }, [user, currentDashboard]);

  const removeDashboard = useCallback((id: string) => {
    if (!user) return;
    storageDeleteDashboard(user.id, id);
    setDashboards(prev => {
      const updated = prev.filter(d => d.id !== id);
      if (currentDashboard?.id === id) {
        setCurrentDashboard(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  }, [user, currentDashboard]);

  const addWidget = useCallback((type: 'pivot-table' | 'pivot-chart' | 'scorecard') => {
    if (!currentDashboard) return;
    const titles: Record<string, string> = {
      'pivot-table': 'New Pivot Table',
      'pivot-chart': 'New Pivot Chart',
      'scorecard': 'New Scorecard',
    };
    const configs: Record<string, object> = {
      'pivot-table': { rows: [], columns: [], values: [] },
      'pivot-chart': { dimensions: [], measures: [], chartType: 'bar' },
      'scorecard': { field: '', aggregation: 'sum', label: '' },
    };
    const widget: Widget = {
      id: uuidv4(),
      type,
      title: titles[type],
      x: 0,
      y: currentDashboard.widgets.length * 400,
      w: 600,
      h: type === 'scorecard' ? 200 : 400,
      config: configs[type] as Widget['config'],
    };
    const updated = {
      ...currentDashboard,
      widgets: [...currentDashboard.widgets, widget],
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  const updateWidget = useCallback((widget: Widget) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      widgets: currentDashboard.widgets.map(w => w.id === widget.id ? widget : w),
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  const removeWidget = useCallback((widgetId: string) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      widgets: currentDashboard.widgets.filter(w => w.id !== widgetId),
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  const addFilter = useCallback((filter: GlobalFilter) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      filters: [...currentDashboard.filters, filter],
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  const updateFilter = useCallback((filter: GlobalFilter) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      filters: currentDashboard.filters.map(f => f.id === filter.id ? filter : f),
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  const removeFilter = useCallback((filterId: string) => {
    if (!currentDashboard) return;
    const updated = {
      ...currentDashboard,
      filters: currentDashboard.filters.filter(f => f.id !== filterId),
    };
    updateDashboard(updated);
  }, [currentDashboard, updateDashboard]);

  return (
    <DataContext.Provider value={{
      csvFiles, dashboards, currentDashboard, allColumns, allData,
      addCSVFile, removeCSVFile, createDashboard, selectDashboard,
      updateDashboard, removeDashboard, addWidget, updateWidget,
      removeWidget, addFilter, updateFilter, removeFilter,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
