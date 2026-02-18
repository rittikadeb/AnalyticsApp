'use client';

import React, { useState, useRef } from 'react';
import { parseCSVFile } from '@/lib/csv-parser';
import { useData } from '@/contexts/DataContext';

interface CSVUploaderProps {
  onClose: () => void;
}

export default function CSVUploader({ onClose }: CSVUploaderProps) {
  const { addCSVFile } = useData();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ file: string; status: string; error?: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setUploading(true);
    const newProgress: { file: string; status: string; error?: string }[] = fileArray.map(f => ({ file: f.name, status: 'processing' }));
    setProgress(newProgress);

    for (let i = 0; i < fileArray.length; i++) {
      try {
        const csvFile = await parseCSVFile(fileArray[i]);
        addCSVFile(csvFile);
        newProgress[i] = { file: fileArray[i].name, status: 'done' };
      } catch (err) {
        newProgress[i] = { file: fileArray[i].name, status: 'error', error: (err as Error).message };
      }
      setProgress([...newProgress]);
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const allDone = progress.length > 0 && progress.every(p => p.status !== 'processing');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Import CSV Data</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300 mb-2">Drag and drop CSV files here</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">or</p>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 text-sm font-medium shadow-sm"
          >
            Browse Files
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">Max 50MB per file</p>
        </div>

        {progress.length > 0 && (
          <div className="mt-4 space-y-2">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {p.status === 'processing' && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {p.status === 'done' && (
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {p.status === 'error' && (
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={p.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}>{p.file}</span>
                {p.error && <span className="text-red-500 dark:text-red-400 text-xs ml-auto">{p.error}</span>}
              </div>
            ))}
          </div>
        )}

        {allDone && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
