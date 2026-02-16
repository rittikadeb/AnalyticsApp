export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface CSVFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  columns: ColumnDef[];
  data: Record<string, string | number | null>[];
}

export interface ColumnDef {
  name: string;
  type: 'string' | 'number' | 'date';
  sourceFile: string;
}

export interface Dashboard {
  id: string;
  userId: string;
  name: string;
  widgets: Widget[];
  filters: GlobalFilter[];
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  type: 'pivot-table' | 'pivot-chart';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: PivotTableConfig | PivotChartConfig;
}

export interface PivotTableConfig {
  rows: string[];
  columns: string[];
  values: ValueField[];
}

export interface PivotChartConfig {
  dimensions: string[];
  measures: ValueField[];
  chartType: 'bar' | 'line' | 'pie' | 'column';
}

export interface ValueField {
  field: string;
  aggregation: 'sum' | 'count' | 'average' | 'min' | 'max';
}

export interface GlobalFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: string | number | [number, number];
}

export interface DragItem {
  field: string;
  type: 'dimension' | 'measure';
  sourceFile: string;
  columnType: 'string' | 'number' | 'date';
}
