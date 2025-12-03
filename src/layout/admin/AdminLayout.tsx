import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-tvk-dark-DEFAULT font-sans text-gray-100 flex">
      {/* 1. Sidebar (Fixed width) */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-8 ml-64 overflow-y-auto">
          {/* This renders the child route components */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
