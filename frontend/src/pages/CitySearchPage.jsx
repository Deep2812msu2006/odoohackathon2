import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cityApi } from '../services/cityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { Search, MapPin, Globe, Filter, Star, DollarSign } from 'lucide-react';

export const CitySearchPage = () => {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [sortBy, setSortBy] = useState('popularityScore');

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', search, regionFilter, sortBy],
    queryFn: async () => {
      const res = await cityApi.getCities({
        search,
        region: regionFilter,
        sortBy,
        order: 'desc',
      });
      return res.data.cities;
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Discover Global Destinations</h1>
        <p className="text-sm text-slate-400">Explore 15+ curated cities from your local PostgreSQL database</p>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city, country, or region..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
          >
            <option value="">All Regions</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="North America">North America</option>
            <option value="Africa">Africa</option>
            <option value="Oceania">Oceania</option>
            <option value="South America">South America</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
          >
            <option value="popularityScore">Sort by Popularity</option>
            <option value="costIndex">Sort by Cost Index</option>
            <option value="name">Sort Alphabetically</option>
          </select>
        </div>
      </div>

      {/* Cities Grid */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city) => (
            <div key={city.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between">
              <div className="h-44 relative overflow-hidden group">
                <img
                  src={city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80'}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{city.popularityScore}</span>
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display font-bold text-xl text-white">{city.name}</h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    <span>{city.country} • {city.region}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Cost Multiplier</span>
                  <span className="font-bold text-emerald-400">{city.costIndex}x</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Curated Activities</span>
                  <span className="font-semibold text-brand-400">{city._count?.activities || 0} items</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
