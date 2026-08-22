import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sidebar } from '../components/Sidebar.jsx';
import { TopHeader } from '../components/TopHeader.jsx';
import { TravelWorldBackground } from '../components/TravelWorldBackground.jsx';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  
  // Persisted Collapsed Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('globetrotter_sidebar_collapsed') === 'true';
  });

  // Mobile Drawer State
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('globetrotter_sidebar_collapsed', String(next));
      return next;
    });
    setMobileOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-400">Loading GlobeTrotter Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent text-slate-100 relative">
      {/* City Travel Background Photo & Multi-City Traveling Dots */}
      <TravelWorldBackground />

      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between z-20">
          <TopHeader
            onToggleSidebar={handleToggleSidebar}
            collapsed={sidebarCollapsed}
          />
        </header>

        {/* Dynamic Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
