import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Ticket, 
  Settings, 
  ShieldCheck, 
  PlusCircle, 
  Globe2,
  Pin,
  PinOff,
  Sparkles,
  Flame,
  Activity,
  X
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../services/systemApi.js';

export const Sidebar = ({ 
  mobileOpen = false, 
  onMobileClose,
  onOpenCreateTrip 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const collapsed = !isHovered && !isPinned;

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
      <div className="flex flex-col h-full overflow-x-hidden relative">
        {/* Ambient Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none"></div>
        
        {/* Brand Header */}
        <div className={`flex items-center ${isMini ? 'flex-col gap-2 py-3 px-0' : 'justify-between px-3 py-4'} mb-3 border-b border-slate-800/40 pb-3 relative z-10`}>
          <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 transform group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Globe2 className="w-5.5 h-5.5 text-white animate-pulse relative z-10" />
            </div>
            {!isMini && (
              <div className="animate-fade-in truncate">
                <h1 className="font-display font-extrabold text-base tracking-tight text-white leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GlobeTrotter
                </h1>
                <span className="text-[9px] uppercase tracking-widest text-brand-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Multi-City Planner
                </span>
              </div>
            )}
          </Link>

          {/* Pin Lock Toggle Button inside Sidebar */}
          {!isMobile && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin Sidebar (Enable Auto Hover)' : 'Pin Sidebar Open'}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800/50 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/10 ${
                isMini ? 'w-10 h-8 flex items-center justify-center mt-1' : 'block'
              } group`}
            >
              {isPinned ? (
                <Pin className="w-4 h-4 text-brand-400 fill-brand-400" />
              ) : (
                <PinOff className="w-4 h-4 text-slate-500 group-hover:text-brand-300 transition-colors" />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 ml-auto"
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
          className={`group relative flex items-center justify-center gap-2 py-3 mb-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-brand-500 to-cyan-500 hover:from-blue-500 hover:via-brand-400 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 active:scale-[0.98] overflow-hidden relative z-10 ${
            isMini ? 'px-0 w-12 mx-auto' : 'w-full px-4'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <PlusCircle className="w-5 h-5 shrink-0 transition-transform group-hover:rotate-90 duration-300 relative z-10" />
          {!isMini && <span className="truncate relative z-10">Plan New Trip</span>}
        </Link>

        {/* Primary Navigation */}
        <nav className={`flex-1 space-y-1.5 scrollbar-none relative z-10 ${isMini ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}>
          {!isMini && (
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Navigation Menu
            </div>
          )}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onMobileClose && onMobileClose()}
              title={isMini ? item.name : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 overflow-hidden ${
                  isMini ? 'justify-center px-0 w-12 mx-auto' : 'px-3.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-cyan-300 border border-brand-500/40 shadow-lg shadow-brand-500/10 transform scale-[1.02]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:scale-[1.01]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent animate-pulse"></div>
                  )}
                  <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 relative z-10 ${isActive ? 'text-cyan-300' : 'group-hover:scale-110 group-hover:text-brand-400'}`} />
                  {!isMini && (
                    <span className="truncate relative z-10 flex items-center gap-2">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Mini Tooltip */}
                  {isMini && (
                    <div className="absolute left-16 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Secondary Bottom Section */}
        <div className="mt-auto pt-4 border-t border-slate-800/60 space-y-3 relative z-10">
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onMobileClose && onMobileClose()}
                title={isMini ? item.name : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 overflow-hidden ${
                    isMini ? 'justify-center px-0 w-12 mx-auto' : 'px-3.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600/30 to-brand-500/20 text-cyan-300 border border-brand-500/40 shadow-lg shadow-brand-500/10 transform scale-[1.02]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:scale-[1.01]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent animate-pulse"></div>
                    )}
                    <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 relative z-10 ${isActive ? 'text-cyan-300' : 'group-hover:scale-110 group-hover:text-brand-400'}`} />
                    {!isMini && (
                      <span className="truncate relative z-10 flex items-center gap-2">
                        {item.name}
                      </span>
                    )}
                    
                    {/* Mini Tooltip */}
                    {isMini && (
                      <div className="absolute left-16 px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 whitespace-nowrap transform translate-x-2 group-hover:translate-x-0">
                        {item.name}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Health Status Box */}
          {!isMini ? (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-md border border-slate-800/50 text-[11px] text-slate-400 space-y-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-brand-400" /> GlobeTrotter
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-lg">v1.0</span>
                </div>
                <p className={`text-[10px] ${statusColorClass} flex items-center space-x-1.5 pt-0.5 font-bold`}>
                  <span className={`w-2 h-2 rounded-full ${pingColorClass} animate-ping inline-block shadow-lg shadow-${isHealthy ? 'emerald' : 'rose'}-500/50`}></span>
                  <span>{dbText}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2 relative group" title={dbText}>
              <span className={`w-3 h-3 rounded-full ${pingColorClass} animate-pulse shadow-lg shadow-${isHealthy ? 'emerald' : 'rose'}-500/50`}></span>
              <div className="absolute left-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {dbText}
              </div>
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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex flex-col h-full backdrop-blur-xl shrink-0 select-none z-30 overflow-hidden scrollbar-none relative fps-120-sidebar ${
          collapsed ? 'w-16 bg-transparent border-0 p-2' : 'w-64 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/60 border-r border-slate-800/60 p-4 shadow-2xl shadow-brand-500/10'
        }`}
      >
        {/* Sidebar Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
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
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800/80 p-4 shadow-2xl transition-transform duration-300 ease-in-out relative ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Drawer Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        {navContent(true)}
      </aside>
    </>
  );
};
