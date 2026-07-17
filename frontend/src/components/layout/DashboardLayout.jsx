import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ portal = 'hr' }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg-primary)' }}>
      {/* Sidebar - Fixed Left */}
      <Sidebar portal={portal} />

      {/* Main Content Area - Scrollable Right */}
      <div style={{
        marginLeft: '260px', // matches Sidebar width
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Floating Decorative Objects inside layout */}
        <div className="floating-bg">
          <div className="floating-object-1" />
          <div className="floating-object-2" />
        </div>

        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Container */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
