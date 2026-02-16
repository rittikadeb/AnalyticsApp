'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DashboardCanvas from './DashboardCanvas';

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar />
      <DashboardCanvas />
    </div>
  );
}
