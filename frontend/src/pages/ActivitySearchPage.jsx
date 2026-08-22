import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../services/activityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { formatCurrency, getCategoryBadgeColor } from '../utils/formatters.js';
import { Search, Ticket, Clock, MapPin, DollarSign, Filter } from 'lucide-react';

export const ActivitySearchPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [
    'sightseeing', 'food', 'adventure', 'culture', 'nightlife', 'relaxation', 'shopping', 'other'
  ];

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', search, categoryFilter],
    queryFn: async () => {
      const res = await activityApi.getActivities({
        search,
        category: categoryFilter,
      });
      return res.data.activities;
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Browse Travel Activities</h1>
        <p className="text-sm text-slate-400">Discover tours, food walks, museums, and outdoor adventures</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity name or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              categoryFilter === ''
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div key={act.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="h-44 relative overflow-hidden group">
                <img
                  src={act.imageUrl || 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&auto=format&fit=crop&q=80'}
                  alt={act.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg border backdrop-blur-md ${getCategoryBadgeColor(act.category)}`}>
                  {act.category}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-500/80 backdrop-blur-md text-white font-bold text-xs rounded-lg shadow-md">
                  {formatCurrency(act.estimatedCost)}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display font-bold text-lg text-white truncate">{act.name}</h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    <span>{act.city?.name}, {act.city?.country}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 line-clamp-2">{act.description || 'No description available.'}</p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span>Duration: {act.durationHours} hrs</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">{act.estimatedCost === 0 ? 'Free' : formatCurrency(act.estimatedCost)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
