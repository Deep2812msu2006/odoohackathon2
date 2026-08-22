import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, Building2, Ticket, DollarSign, User, BarChart3, PlusCircle } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Trips', path: '/trips', icon: Map },
    { name: 'Discover Cities', path: '/cities', icon: Building2 },
    { name: 'Browse Activities', path: '/activities', icon: Ticket },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    { name: 'Platform Admin', path: '/admin', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-card border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <NavLink
          to="/trips/new"
          className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-glow transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Plan New Trip</span>
        </NavLink>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-4 rounded-xl glass-card bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">GlobeTrotter v1.0</p>
        <p>Production Full-Stack Architecture</p>
        <p className="text-[10px] text-emerald-400 flex items-center space-x-1 mt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
          <span>PostgreSQL Active</span>
        </p>
      </div>
    </aside>
  );
};
