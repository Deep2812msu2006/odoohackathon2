import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi.js';
import { ShieldCheck, Users, Map, Building2, Ticket, Share2, Star, TrendingUp } from 'lucide-react';

export const AdminDashboardPage = () => {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data.analytics;
    },
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-2">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Executing PostgreSQL aggregate queries...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return <div className="text-center py-12 text-rose-400">Failed to load admin analytics.</div>;
  }

  const { overview, popularCities, popularActivities } = analyticsData;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Platform Administration Analytics</h1>
          <p className="text-sm text-slate-400">Real database aggregate metrics calculated directly in PostgreSQL</p>
        </div>
      </div>

      {/* Aggregate Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Users</p>
            <p className="font-display text-2xl font-bold text-white">{overview.totalUsers}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Planned Trips</p>
            <p className="font-display text-2xl font-bold text-white">{overview.totalTrips}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Public Trips / Copies</p>
            <p className="font-display text-2xl font-bold text-white">{overview.publicTrips} / {overview.totalShares}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Database Cities</p>
            <p className="font-display text-2xl font-bold text-white">{overview.totalCities}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Available Activities</p>
            <p className="font-display text-2xl font-bold text-white">{overview.totalActivities}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Aggregation Engine</p>
            <p className="font-display text-xs font-bold text-emerald-400 mt-1">Prisma SQL GroupBy</p>
          </div>
        </div>
      </div>

      {/* Popular Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Cities */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Most Popular Cities</h3>
          <div className="space-y-3">
            {popularCities.map((city, idx) => (
              <div key={city.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center font-bold text-xs text-brand-400">#{idx + 1}</span>
                  <img src={city.imageUrl} alt={city.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold text-sm text-white">{city.name}</p>
                    <p className="text-xs text-slate-400">{city.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{city.popularityScore}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Used Activities */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Most Added Activities</h3>
          <div className="space-y-3">
            {popularActivities.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3">No activities added to trips yet.</p>
            ) : (
              popularActivities.map((act, idx) => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 text-center font-bold text-xs text-purple-400">#{idx + 1}</span>
                    <div>
                      <p className="font-bold text-sm text-white">{act.name}</p>
                      <p className="text-xs text-slate-400">{act.cityName} • {act.category}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-500/20 text-brand-300 rounded-lg text-xs font-bold border border-brand-500/30">
                    {act.usageCount} trips
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
