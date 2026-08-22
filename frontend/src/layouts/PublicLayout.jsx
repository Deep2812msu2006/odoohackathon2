import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="glass-card border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <p>© 2026 GlobeTrotter Travel Planning Platform. Production Full-Stack React Architecture.</p>
      </footer>
    </div>
  );
};
