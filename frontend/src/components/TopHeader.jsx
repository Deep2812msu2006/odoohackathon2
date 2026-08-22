import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { cityApi } from '../services/cityApi.js';
import { tripApi } from '../services/tripApi.js';
import { activityApi } from '../services/activityApi.js';
import { UserAvatar } from './UserAvatar.jsx';
import { User, LogOut, ShieldCheck, Search, X, MapPin, Map, Ticket, ArrowRight, ArrowLeft, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';

export const TopHeader = ({ onToggleSidebar, collapsed = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search results dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setResultsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Cities
  const { data: matchedCities = [] } = useQuery({
    queryKey: ['searchCities', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await cityApi.getCities({ search: searchTerm });
      return res.data.cities.slice(0, 4);
    },
    enabled: searchTerm.trim().length > 0,
  });

  // Search User Trips
  const { data: matchedTrips = [] } = useQuery({
    queryKey: ['searchTrips', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await tripApi.getUserTrips();
      const query = searchTerm.toLowerCase();
      return (res.data.trips || []).filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query)) ||
          (t.stops || []).some((s) => s.city?.name?.toLowerCase().includes(query))
      ).slice(0, 3);
    },
    enabled: searchTerm.trim().length > 0,
  });

  // Search Activities
  const { data: matchedActivities = [] } = useQuery({
    queryKey: ['searchActivities', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const res = await activityApi.getActivities({ search: searchTerm });
      return res.data.activities.slice(0, 3);
    },
    enabled: searchTerm.trim().length > 0,
  });

  const hasResults =
    matchedCities.length > 0 || matchedTrips.length > 0 || matchedActivities.length > 0;

  const handleSelectResult = (path) => {
    setSearchTerm('');
    setResultsOpen(false);
    navigate(path);
  };

  // Direct Enter Key Navigation Handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      const query = encodeURIComponent(searchTerm.trim());

      if (matchedTrips.length > 0) {
        handleSelectResult(`/trips/${matchedTrips[0].id}/builder`);
        return;
      }

      if (matchedCities.length > 0) {
        handleSelectResult(`/cities?search=${query}`);
        return;
      }

      if (matchedActivities.length > 0) {
        handleSelectResult(`/activities?search=${query}`);
        return;
      }

      handleSelectResult(`/cities?search=${query}`);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1 && location.pathname !== '/dashboard') {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full flex items-center justify-between">
      {/* Left Action Area: Universal Back Button, Sidebar Toggles & Search */}
      <div className="flex items-center space-x-2.5">
        {/* Universal Back Navigation Button */}
        <button
          onClick={handleGoBack}
          title="Go Back to Previous Page"
          className="p-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 transition-all border border-slate-800/60 flex items-center justify-center hover:border-cyan-500/50 group shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Mobile Drawer Toggle Button */}
        <button
          onClick={onToggleSidebar}
          title="Open Menu"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all border border-slate-800/50 md:hidden flex items-center justify-center shrink-0"
        >
          <Menu className="w-4 h-4 text-brand-400" />
        </button>

        {/* Transparent Glass Search Input */}
        <div className="relative w-64 sm:w-80 hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setResultsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setResultsOpen(true)}
              placeholder="Quick search (press Enter to go directly)..."
              className="w-full pl-10 pr-9 py-2 bg-slate-950/30 hover:bg-slate-950/50 focus:bg-slate-950/80 text-xs text-slate-100 rounded-xl border border-slate-800/60 focus:border-cyan-500/60 outline-none transition-all placeholder-slate-500 backdrop-blur-sm shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Autocomplete Direct Navigation Results Dropdown */}
          {resultsOpen && searchTerm.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 glass-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-50 text-xs max-h-96 overflow-y-auto animate-fade-in divide-y divide-slate-800/80">
              {!hasResults ? (
                <div
                  onClick={() => handleSelectResult(`/cities?search=${encodeURIComponent(searchTerm)}`)}
                  className="p-4 text-center text-slate-400 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between"
                >
                  <span>Search for "{searchTerm}" on Cities Page...</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </div>
              ) : (
                <>
                  {/* Cities Section */}
                  {matchedCities.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Cities (Click to go directly)</span>
                      </div>
                      {matchedCities.map((city) => (
                        <div
                          key={city.id}
                          onClick={() => handleSelectResult(`/cities?search=${encodeURIComponent(city.name)}`)}
                          className="px-3.5 py-2 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                        >
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={city.imageUrl}
                              alt={city.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                              <p className="font-extrabold text-white text-xs">{city.name}</p>
                              <p className="text-[10px] text-slate-400">{city.country} • {city.region}</p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trips Section */}
                  {matchedTrips.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center space-x-1">
                        <Map className="w-3 h-3" />
                        <span>Trips (Click to open itinerary)</span>
                      </div>
                      {matchedTrips.map((trip) => (
                        <div
                          key={trip.id}
                          onClick={() => handleSelectResult(`/trips/${trip.id}/builder`)}
                          className="px-3.5 py-2 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-extrabold text-white text-xs truncate">{trip.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {(trip.stops || []).map((s) => s.city?.name).join(', ') || 'No stops'}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activities Section */}
                  {matchedActivities.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Activities (Click to view details)</span>
                      </div>
                      {matchedActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => handleSelectResult(`/activities?search=${encodeURIComponent(act.name)}`)}
                          className="px-3.5 py-2 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-slate-200 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-white text-xs truncate">{act.name}</p>
                            <p className="text-[10px] text-slate-400">{act.category} • ${act.estimatedCost}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="sm:hidden text-sm font-black text-white">GlobeTrotter</div>
      </div>

      {/* Right Action Area: User Profile Dropdown */}
      <div className="flex items-center space-x-4 ml-auto">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-2xl hover:bg-slate-800/40 transition-colors focus:outline-none"
          >
            <div className="relative">
              <UserAvatar
                name={user?.name}
                photoUrl={user?.profilePhotoUrl}
                className="w-8 h-8 rounded-xl ring-2 ring-cyan-500/60"
              />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute -bottom-0.5 -right-0.5 ring-2 ring-slate-950"></span>
            </div>
            <span className="hidden md:block font-bold text-xs text-slate-200">{user?.name}</span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-3 w-56 glass-card rounded-2xl shadow-2xl py-2 z-50 border border-slate-800/80 text-slate-200 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
                <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Signed in as</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-3 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="w-4 h-4 text-pink-400" />
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
