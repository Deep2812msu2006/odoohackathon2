import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { tripApi } from '../services/tripApi.js';
import { cityApi } from '../services/cityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { formatDateRange, formatCurrency } from '../utils/formatters.js';
import { Compass, Map, Building2, Globe, Plus, ArrowRight, Share2, Sparkles, Calendar } from 'lucide-react';

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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-8 border border-brand-500/20 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name}!</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to plan your next multi-city journey?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Organize multi-stop itineraries, assign daily activities, calculate dynamic budgets, and share your adventures with travel partners.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/trips/new"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm rounded-xl shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Trip</span>
            </Link>
            <Link
              to="/cities"
              className="inline-flex items-center space-x-2 px-5 py-2.5 glass-card hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-xl transition-colors border border-slate-700"
            >
              <Building2 className="w-4 h-4 text-brand-400" />
              <span>Explore 15+ Cities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Trips</p>
            <p className="font-display text-2xl font-bold text-white">{trips.length}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Public Shared</p>
            <p className="font-display text-2xl font-bold text-white">{publicTripsCount}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Cities Explored</p>
            <p className="font-display text-2xl font-bold text-white">{citiesExploredCount}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Platform Status</p>
            <p className="font-display text-sm font-semibold text-emerald-400 flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>PostgreSQL Live</span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent Trips Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Your Recent Trips</h2>
            <p className="text-xs text-slate-400">Continue planning your active itineraries</p>
          </div>
          <Link to="/trips" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1">
            <span>View All Trips ({trips.length})</span>
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
              <div key={trip.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800">
                <div className="relative h-44 overflow-hidden group">
                  <img
                    src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  {trip.isPublic && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-lg tracking-wider">
                      Public
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-display font-bold text-lg text-white truncate">{trip.name}</h3>
                    <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 line-clamp-2">{trip.description || 'No description provided.'}</p>
                    
                    {/* Cities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(trip.stops || []).map((stop) => (
                        <span key={stop.id} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-medium rounded-md border border-slate-700">
                          {stop.city?.name}
                        </span>
                      ))}
                      {(trip.stops || []).length === 0 && (
                        <span className="text-[11px] text-slate-500 italic">No stops added yet</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      <span>Edit Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors"
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

      {/* Recommended Destination Cities */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-white">Top Recommended Destinations</h2>
            <p className="text-xs text-slate-400">Popular cities from local PostgreSQL database</p>
          </div>
          <Link to="/cities" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
            Explore All Cities →
          </Link>
        </div>

        {citiesLoading ? (
          <GridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCities.map((city) => (
              <div key={city.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
                <div className="h-32 overflow-hidden relative">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                  <span className="absolute bottom-2 left-3 font-display font-bold text-white text-base">
                    {city.name}
                  </span>
                </div>
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{city.country}</span>
                    <span className="text-amber-400 font-semibold">★ {city.popularityScore}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
                    <span>Cost Index: {city.costIndex}x</span>
                    <span className="text-brand-400 font-medium">{city._count?.activities || 0} activities</span>
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
