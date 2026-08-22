import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Compass, 
  Ticket, 
  Settings, 
  ShieldCheck, 
  PlusCircle, 
  Globe2 
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../services/systemApi.js';

export const Sidebar = ({ onOpenCreateTrip }) => {
  const { data: healthData } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      try {
        const res = await systemApi.getHealth();
        return res;
      } catch (err) {
        return { status: 'unhealthy', database: 'Offline' };
      }
    },
    refetchInterval: 30000,
  });

  const dbText = healthData?.status === 'healthy' ? `${healthData.database} Active` : 'Database Offline';
  const statusColorClass = healthData?.status === 'healthy' ? 'text-emerald-400' : 'text-rose-400';
  const pingColorClass = healthData?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500';

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

  return (
    <aside className="w-64 h-full bg-[#0B1120] border-r border-slate-800/80 flex flex-col p-4 select-none shrink-0 hidden md:flex">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Globe2 className="w-5 h-5 text-white"/>
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-none">GlobeTrotter</h1>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Multi-City Planner</span>
        </div>
      </div>

      {/* Primary Action Button */}
      <Link
        to="/trips/new"
        onClick={(e) => {
          if (onOpenCreateTrip) {
            e.preventDefault();
            onOpenCreateTrip();
          }
        }}
        className="group relative w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-6 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-md shadow-blue-600/25 active:scale-[0.98]"
      >
        <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"/>
        <span>Plan New Trip</span>
      </Link>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Menu
        </div>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Secondary Bottom Section */}
      <div className="mt-auto pt-4 border-t border-slate-800/60 space-y-4">
        <div className="space-y-1">
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Dynamic Database Status Box */}
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-300">GlobeTrotter v1.0</p>
          <p className="text-[10px] text-slate-500">Production Full-Stack Architecture</p>
          <p className={`text-[10px] ${statusColorClass} flex items-center space-x-1 pt-1`}>
            <span className={`w-2 h-2 rounded-full ${pingColorClass} animate-ping inline-block`}></span>
            <span>{dbText}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
