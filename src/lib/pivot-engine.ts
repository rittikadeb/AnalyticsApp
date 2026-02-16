import { PivotTableConfig, PivotChartConfig, GlobalFilter } from '@/types';

type Row = Record<string, string | number | null>;

export function applyFilters(data: Row[], filters: GlobalFilter[]): Row[] {
  return data.filter(row => {
    return filters.every(filter => {
      const val = row[filter.field];
      if (val == null) return false;

      switch (filter.operator) {
        case 'equals':
          return String(val) === String(filter.value);
        case 'contains':
          return String(val).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'gt':
          return Number(val) > Number(filter.value);
        case 'lt':
          return Number(val) < Number(filter.value);
        case 'between': {
          const [min, max] = filter.value as [number, number];
          const num = Number(val);
          return num >= min && num <= max;
        }
        default:
          return true;
      }
    });
  });
}

function aggregate(values: (number | null)[], agg: string): number {
  const nums = values.filter((v): v is number => v != null && !isNaN(v));
  if (nums.length === 0) return 0;

  switch (agg) {
    case 'sum':
      return nums.reduce((a, b) => a + b, 0);
    case 'count':
      return nums.length;
    case 'average':
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min':
      return Math.min(...nums);
    case 'max':
      return Math.max(...nums);
    case 'unique':
      return new Set(nums).size;
    default:
      return nums.reduce((a, b) => a + b, 0);
  }
}

export interface PivotTableResult {
  headers: string[];
  rows: (string | number)[][];
}

export function computePivotTable(data: Row[], config: PivotTableConfig): PivotTableResult {
  const { rows: rowFields, columns: colFields, values: valueFields } = config;

  if (rowFields.length === 0 && valueFields.length === 0) {
    return { headers: [], rows: [] };
  }

  // Group data by row keys
  const groups = new Map<string, Row[]>();
  const colValues = new Set<string>();

  data.forEach(row => {
    const rowKey = rowFields.map(f => String(row[f] ?? '(empty)')).join('|||');
    if (!groups.has(rowKey)) groups.set(rowKey, []);
    groups.get(rowKey)!.push(row);

    if (colFields.length > 0) {
      const colKey = colFields.map(f => String(row[f] ?? '(empty)')).join(' / ');
      colValues.add(colKey);
    }
  });

  const sortedColValues = Array.from(colValues).sort();

  // Build headers
  const headers: string[] = [...rowFields];
  if (colFields.length > 0 && valueFields.length > 0) {
    sortedColValues.forEach(cv => {
      valueFields.forEach(vf => {
        headers.push(`${cv} - ${vf.aggregation}(${vf.field})`);
      });
    });
  } else {
    valueFields.forEach(vf => {
      headers.push(`${vf.aggregation}(${vf.field})`);
    });
  }

  // Build rows
  const resultRows: (string | number)[][] = [];
  const sortedGroupKeys = Array.from(groups.keys()).sort();

  sortedGroupKeys.forEach(groupKey => {
    const groupRows = groups.get(groupKey)!;
    const rowValues = groupKey.split('|||');
    const resultRow: (string | number)[] = [...rowValues];

    if (colFields.length > 0 && valueFields.length > 0) {
      // Sub-group by column values
      const colGroups = new Map<string, Row[]>();
      groupRows.forEach(row => {
        const colKey = colFields.map(f => String(row[f] ?? '(empty)')).join(' / ');
        if (!colGroups.has(colKey)) colGroups.set(colKey, []);
        colGroups.get(colKey)!.push(row);
      });

      sortedColValues.forEach(cv => {
        const colRows = colGroups.get(cv) || [];
        valueFields.forEach(vf => {
          const vals = colRows.map(r => {
            const v = r[vf.field];
            return v == null ? null : Number(v);
          });
          resultRow.push(Math.round(aggregate(vals, vf.aggregation) * 100) / 100);
        });
      });
    } else {
      valueFields.forEach(vf => {
        const vals = groupRows.map(r => {
          const v = r[vf.field];
          return v == null ? null : Number(v);
        });
        resultRow.push(Math.round(aggregate(vals, vf.aggregation) * 100) / 100);
      });
    }

    resultRows.push(resultRow);
  });

  return { headers, rows: resultRows };
}

export interface PivotChartResult {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

export function computePivotChart(data: Row[], config: PivotChartConfig): PivotChartResult {
  const { dimensions, measures } = config;

  if (dimensions.length === 0 || measures.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Group by dimension combination
  const groups = new Map<string, Row[]>();
  data.forEach(row => {
    const key = dimensions.map(d => String(row[d] ?? '(empty)')).join(' / ');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });

  const labels = Array.from(groups.keys()).sort();
  const datasets = measures.map(m => ({
    label: `${m.aggregation}(${m.field})`,
    data: labels.map(label => {
      const rows = groups.get(label)!;
      const vals = rows.map(r => {
        const v = r[m.field];
        return v == null ? null : Number(v);
      });
      return Math.round(aggregate(vals, m.aggregation) * 100) / 100;
    }),
  }));

  return { labels, datasets };
}
