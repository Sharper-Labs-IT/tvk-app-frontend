import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout: React.FC = () => {
  return (
    // FIX: Changed 'bg-tvk-dark-DEFAULT' to 'bg-tvk-dark'
    <div className="min-h-screen w-full bg-tvk-dark font-sans text-gray-100 flex">
      {/* 1. Sidebar (Fixed width) */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      {/* FIX: Changed 'bg-tvk-dark-DEFAULT' to 'bg-tvk-dark' */}
      <div className="flex-1 flex flex-col min-h-screen bg-tvk-dark">
        {/* Header */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        {/* FIX: Changed 'bg-tvk-dark-DEFAULT' to 'bg-tvk-dark' */}
        <main className="flex-1 p-8 ml-64 overflow-y-auto bg-tvk-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
