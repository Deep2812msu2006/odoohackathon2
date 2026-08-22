import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, LogOut, ShieldCheck, Search, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

export const TopHeader = ({ onToggleSidebar, collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="w-full flex items-center justify-between">
      
      {/* Left Action Area: Sidebar Toggle & Search */}
      <div className="flex items-center space-x-3">
        
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800/50 hidden md:flex items-center justify-center hover:border-slate-700"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-brand-400 animate-pulse" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-400 hover:text-brand-400 transition-colors" />
          )}
        </button>

        {/* Mobile Drawer Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title="Open Menu"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all border border-slate-800/50 md:hidden flex items-center justify-center"
        >
          <Menu className="w-5 h-5 text-brand-400" />
        </button>

        {/* Quick Search Bar */}
        <div className="relative w-64 sm:w-72 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Quick search (trips, stops, cities)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/40 hover:bg-slate-900/60 focus:bg-slate-900/85 text-xs text-slate-200 rounded-xl border border-slate-800/80 focus:border-brand-500/50 outline-none transition-all placeholder-slate-500"
          />
        </div>

        <div className="sm:hidden text-sm font-bold text-white tracking-tight">GlobeTrotter</div>
      </div>

      {/* Right Action Area: User Profile Dropdown */}
      <div className="flex items-center space-x-4 ml-auto">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-2xl hover:bg-slate-800/40 transition-colors focus:outline-none"
          >
            <div className="relative">
              <img
                src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/60"
              />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0B1120]"></span>
            </div>
            <span className="hidden md:block font-medium text-xs text-slate-200">{user?.name}</span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-56 bg-[#0B1120] rounded-2xl shadow-2xl py-2 z-50 border border-slate-800/80 text-slate-200 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4 text-blue-400" />
                <span>My Profile & Settings</span>
              </Link>

              <Link
                to="/admin"
                className="flex items-center space-x-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Platform Analytics</span>
              </Link>

              <div className="border-t border-slate-800/60 my-1"></div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
