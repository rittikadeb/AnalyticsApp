import Papa from 'papaparse';
import { CSVFile, ColumnDef } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function detectColumnType(values: (string | null | undefined)[]): 'string' | 'number' | 'date' {
  const sample = values.filter(v => v != null && v !== '').slice(0, 100);
  if (sample.length === 0) return 'string';

  const numberCount = sample.filter(v => !isNaN(Number(v))).length;
  if (numberCount / sample.length > 0.8) return 'number';

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/,
    /^\d{2}\/\d{2}\/\d{4}/,
    /^\d{2}-\d{2}-\d{4}/,
  ];
  const dateCount = sample.filter(v =>
    datePatterns.some(p => p.test(v!)) || !isNaN(Date.parse(v!))
  ).length;
  if (dateCount / sample.length > 0.8) return 'date';

  return 'string';
}

export function parseCSVFile(file: File): Promise<CSVFile> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`File "${file.name}" exceeds the 50MB size limit.`));
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error(`File "${file.name}" is not a CSV file.`));
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(e => e.type === 'Quotes' || e.type === 'FieldMismatch');
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV parsing errors in "${file.name}": ${criticalErrors.map(e => `Row ${e.row}: ${e.message}`).join('; ')}`));
            return;
          }
        }

        const fields = results.meta.fields || [];
        if (fields.length === 0) {
          reject(new Error(`File "${file.name}" has no columns.`));
          return;
        }

        const rawData = results.data as Record<string, string>[];
        const columns: ColumnDef[] = fields.map(name => ({
          name,
          type: detectColumnType(rawData.map(row => row[name])),
          sourceFile: file.name,
        }));

        const data = rawData.map(row => {
          const parsed: Record<string, string | number | null> = {};
          columns.forEach(col => {
            const val = row[col.name];
            if (val == null || val === '') {
              parsed[col.name] = null;
            } else if (col.type === 'number') {
              const num = Number(val);
              parsed[col.name] = isNaN(num) ? val : num;
            } else {
              parsed[col.name] = val;
            }
          });
          return parsed;
        });

        resolve({
          id: uuidv4(),
          name: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          columns,
          data,
        });
      },
      error(error) {
        reject(new Error(`Failed to parse "${file.name}": ${error.message}`));
      },
    });
  });
}
