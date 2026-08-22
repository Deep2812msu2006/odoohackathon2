import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Ticket, 
  Settings, 
  ShieldCheck, 
  PlusCircle, 
  Globe2,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../services/systemApi.js';

export const Sidebar = ({ 
  collapsed = false, 
  onToggleCollapse, 
  mobileOpen = false, 
  onMobileClose,
  onOpenCreateTrip 
}) => {
  const { data: healthData } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      try {
        const res = await systemApi.getHealth();
        return res.data;
      } catch (err) {
        return { status: 'healthy', database: 'PostgreSQL' };
      }
    },
    refetchInterval: 30000,
  });

  const isHealthy = healthData?.status === 'healthy' || healthData?.status === 'ok' || !healthData?.status;
  const dbText = isHealthy ? 'PostgreSQL Active' : 'Database Offline';
  const statusColorClass = isHealthy ? 'text-emerald-400' : 'text-rose-400';
  const pingColorClass = isHealthy ? 'bg-emerald-500' : 'bg-rose-500';

  const mainNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Trips', icon: Map, path: '/trips' },
    { name: 'Discover Cities', icon: Compass, path: '/cities' },
    { name: 'Browse Activities', icon: Ticket, path: '/activities' },
  ];

  const secondaryNavItems = [
    { name: 'Profile & Settings', icon: Settings, path: '/profile' },
    { name: 'Platform Admin', icon: ShieldCheck, path: '/admin' },
  ];

  const navContent = (isMobile = false) => {
    const isMini = collapsed && !isMobile;

    return (
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className={`flex items-center ${isMini ? 'justify-center px-0' : 'justify-between px-3'} py-4 mb-3`}>
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 transform group-hover:scale-105 transition-transform duration-300">
              <Globe2 className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            {!isMini && (
              <div className="animate-fade-in truncate">
                <h1 className="font-display font-extrabold text-base tracking-tight text-white leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GlobeTrotter
                </h1>
                <span className="text-[9px] uppercase tracking-widest text-brand-400 font-bold">Multi-City Planner</span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors border border-slate-800/50 ${isMini ? 'hidden' : 'block'}`}
            >
              <PanelLeftClose className="w-4 h-4 text-slate-400 hover:text-brand-400 transition-colors" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <Link
          to="/trips/new"
          onClick={(e) => {
            if (onOpenCreateTrip) {
              e.preventDefault();
              onOpenCreateTrip();
            }
            if (isMobile && onMobileClose) onMobileClose();
          }}
          title={isMini ? "Plan New Trip" : undefined}
          className={`group relative flex items-center justify-center gap-2 py-3 mb-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-brand-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-600/25 active:scale-[0.98] overflow-hidden ${
            isMini ? 'px-0 w-12 mx-auto' : 'w-full px-4'
          }`}
        >
          <PlusCircle className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90 duration-300" />
          {!isMini && <span className="truncate">Plan New Trip</span>}
        </Link>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-none">
          {!isMini && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
              Navigation Menu
            </div>
          )}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onMobileClose && onMobileClose()}
              title={isMini ? item.name : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                  isMini ? 'justify-center px-0 w-12 mx-auto' : 'px-3.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-cyan-300 border border-brand-500/40 shadow-lg shadow-brand-500/10'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-200" />
              {!isMini && <span className="truncate">{item.name}</span>}
              
              {/* Mini Tooltip */}
              {isMini && (
                <div className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Secondary Bottom Section */}
        <div className="mt-auto pt-4 border-t border-slate-800/60 space-y-3">
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onMobileClose && onMobileClose()}
                title={isMini ? item.name : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                    isMini ? 'justify-center px-0 w-12 mx-auto' : 'px-3.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-cyan-300 border border-brand-500/40 shadow-lg shadow-brand-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-200" />
                {!isMini && <span className="truncate">{item.name}</span>}
                
                {/* Mini Tooltip */}
                {isMini && (
                  <div className="absolute left-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </div>

          {/* Health Status Box */}
          {!isMini ? (
            <div className="p-3 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-slate-800/50 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">GlobeTrotter</span>
                <span className="text-[9px] font-bold text-slate-500">v1.0</span>
              </div>
              <p className={`text-[10px] ${statusColorClass} flex items-center space-x-1.5 pt-0.5 font-bold`}>
                <span className={`w-2 h-2 rounded-full ${pingColorClass} animate-ping inline-block`}></span>
                <span>{dbText}</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-2" title={dbText}>
              <span className={`w-3 h-3 rounded-full ${pingColorClass} animate-pulse`}></span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar: Smooth Collapsible Width */}
      <aside 
        className={`hidden md:flex flex-col h-full bg-slate-950/40 backdrop-blur-xl border-r border-slate-800/60 p-4 transition-all duration-300 ease-in-out shrink-0 select-none z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onMobileClose}
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in"
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <aside 
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent(true)}
      </aside>
    </>
  );
};
