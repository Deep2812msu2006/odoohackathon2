import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Compass, Plus, User, LogOut, ShieldCheck, Map, Building2, Ticket, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Compass },
    { name: 'My Trips', path: '/trips', icon: Map },
    { name: 'Cities', path: '/cities', icon: Building2 },
    { name: 'Activities', path: '/activities', icon: Ticket },
  ];

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-to-tr from-brand-600 via-brand-500 to-purple-500 rounded-2xl shadow-glow text-white group-hover:scale-105 transition-transform duration-300 ring-2 ring-brand-400/30">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
              <span className="block text-[9px] uppercase font-bold tracking-widest text-brand-400 -mt-1">
                Multi-City Travel Platform
              </span>
            </div>
          </Link>

          {/* Quick Header Nav Links (Desktop) */}
          {user && (
            <nav className="hidden lg:flex items-center space-x-1 glass-card px-3 py-1.5 rounded-2xl border border-slate-800/80 bg-slate-900/50">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Section */}
          {user ? (
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/trips/new"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow transition-all transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>Plan Trip</span>
              </Link>

              {/* User Avatar Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2.5 p-1.5 rounded-2xl hover:bg-slate-800/80 transition-colors focus:outline-none ring-1 ring-slate-800 hover:ring-brand-500/50"
                >
                  <div className="relative">
                    <img
                      src={user.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                      alt={user.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-brand-500/60"
                    />
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-slate-950"></span>
                  </div>
                  <span className="hidden md:block font-semibold text-xs text-slate-200">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-60 glass-card rounded-2xl shadow-2xl py-2 z-50 border border-slate-800 text-slate-200 animate-fade-in"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 text-brand-400" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/admin"
                      className="flex items-center space-x-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Platform Analytics</span>
                    </Link>

                    <div className="border-t border-slate-800 my-1"></div>

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
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white rounded-xl shadow-glow transition-all"
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
