import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass } from 'lucide-react';
import { TravelWorldBackground } from '../components/TravelWorldBackground.jsx';

export const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* City Travel Background Photo & Multi-City Traveling Dots */}
      <TravelWorldBackground />

      {/* Dynamic Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 space-y-3">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="p-3 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-2xl shadow-glow text-white group-hover:scale-105 transition-transform">
            <Compass className="w-8 h-8" />
          </div>
          <span className="font-display font-bold text-3xl bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
            GlobeTrotter
          </span>
        </Link>
        <p className="text-sm text-slate-400">Personalized Multi-City Travel Planning Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-card rounded-3xl p-8 border border-slate-800/80 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
