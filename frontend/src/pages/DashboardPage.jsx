import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tripApi } from '../services/tripApi.js';
import { cityApi } from '../services/cityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { formatDateRange, formatCurrency } from '../utils/formatters.js';
import { Compass, Map, Building2, Globe, Plus, ArrowRight, Share2, Sparkles, Calendar, Star, CheckCircle2, Ticket } from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await tripApi.getUserTrips();
      return res.data.trips;
    },
  });

  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities', 'recommended'],
    queryFn: async () => {
      const res = await cityApi.getCities({ sortBy: 'popularityScore', order: 'desc' });
      return res.data.cities.slice(0, 4);
    },
  });

  const trips = tripsData || [];
  const recommendedCities = citiesData || [];

  const publicTripsCount = trips.filter((t) => t.isPublic).length;
  const citiesExploredCount = new Set(
    trips.flatMap((t) => (t.stops || []).map((s) => s.city?.name)).filter(Boolean)
  ).size;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner with Dynamic Gradient Glow */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-10 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-brand-950/40 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Welcome back, {user?.name}!</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Design & Collaborate on <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Multi-City Journeys</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Build multi-stop itineraries, assign scheduled activities, calculate dynamic budgets, and publish public travel links.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/trips/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm rounded-2xl shadow-glow transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Trip</span>
            </Link>
            <Link
              to="/cities"
              className="inline-flex items-center space-x-2 px-6 py-3 glass-card hover:bg-slate-800/80 text-slate-200 font-semibold text-sm rounded-2xl transition-all border border-slate-700/80"
            >
              <Building2 className="w-4 h-4 text-brand-400" />
              <span>Explore 16+ Cities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row with Glowing Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Planned Trips</p>
            <p className="font-display text-3xl font-extrabold text-white mt-1">{trips.length}</p>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl border border-brand-500/20 shadow-glow">
            <Map className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Public Shares</p>
            <p className="font-display text-3xl font-extrabold text-emerald-400 mt-1">{publicTripsCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-glow">
            <Share2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cities Included</p>
            <p className="font-display text-3xl font-extrabold text-purple-400 mt-1">{citiesExploredCount}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 shadow-glow">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Database Status</p>
            <p className="font-display text-sm font-bold text-emerald-400 flex items-center space-x-1.5 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>PostgreSQL Active</span>
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-glow">
            <Globe className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Your Active Trips</h2>
            <p className="text-xs text-slate-400">Continue building your multi-city itineraries</p>
          </div>
          <Link to="/trips" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1">
            <span>View All ({trips.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tripsLoading ? (
          <GridSkeleton count={3} />
        ) : trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.slice(0, 3).map((trip) => (
              <div key={trip.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/80">
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                  
                  {trip.isPublic && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-xl tracking-wider shadow-lg">
                      Public Link
                    </span>
                  )}

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display font-bold text-xl text-white truncate">{trip.name}</h3>
                    <p className="text-xs text-slate-300 flex items-center space-x-1.5 mt-0.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{trip.description || 'No description provided.'}</p>
                    
                    {/* Cities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(trip.stops || []).map((stop) => (
                        <span key={stop.id} className="px-2.5 py-1 bg-slate-900/90 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-800 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                          <span>{stop.city?.name}</span>
                        </span>
                      ))}
                      {(trip.stops || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic">No city stops added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs rounded-xl shadow-glow flex items-center space-x-1.5 transition-all"
                    >
                      <span>Edit Itinerary</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors border border-slate-700/60"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Recommended Cities */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">Top Destination Cities</h2>
            <p className="text-xs text-slate-400">Curated from local PostgreSQL database records</p>
          </div>
          <Link to="/cities" className="text-xs font-bold text-brand-400 hover:text-brand-300">
            Explore All Cities →
          </Link>
        </div>

        {citiesLoading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCities.map((city) => (
              <div key={city.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div className="h-36 overflow-hidden relative group">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md text-amber-400 font-bold text-[11px] rounded-lg border border-amber-500/30 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{city.popularityScore}</span>
                  </span>
                  <span className="absolute bottom-2.5 left-3 font-display font-extrabold text-white text-lg">
                    {city.name}
                  </span>
                </div>
                <div className="p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>{city.country}</span>
                    <span className="text-brand-300 font-bold">{city.region}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Cost: <strong className="text-emerald-400">{city.costIndex}x</strong></span>
                    <span className="text-purple-400 font-semibold">{city._count?.activities || 0} activities</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
