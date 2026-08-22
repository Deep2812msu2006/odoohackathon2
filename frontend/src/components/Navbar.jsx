import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, Plus, User, LogOut, ShieldCheck, MapPin, Search } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-xl shadow-glow text-white group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-300 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
              <span className="block text-[10px] uppercase font-semibold tracking-widest text-brand-400">
                Multi-City Travel Planner
              </span>
            </div>
          </Link>

          {/* User Logged In Header Navigation */}
          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/trips/new"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-medium text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Trip</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors focus:outline-none"
                >
                  <img
                    src={user.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/50"
                  />
                  <span className="hidden md:block font-medium text-sm text-slate-200">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-2xl py-2 z-50 border border-slate-800 text-slate-200"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-slate-800/80 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-brand-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-slate-800/80 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Admin Analytics</span>
                    </Link>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-md transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
