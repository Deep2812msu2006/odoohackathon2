import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cityApi } from '../services/cityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { formatCurrency } from '../utils/formatters.js';
import {
  Search, MapPin, Globe, Filter, Star, DollarSign, Sparkles, Ticket, X, ArrowRight, CheckCircle2, Compass, Layers, Plus, Play, Video
} from 'lucide-react';

// Curated HD Cinematic Video Trailers for Cities
const CITY_VIDEO_TRAILERS = {
  Paris: 'https://assets.mixkit.co/videos/preview/mixkit-eiffel-tower-in-paris-at-night-4228-large.mp4',
  Tokyo: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-tokyo-city-at-night-41544-large.mp4',
  'New York': 'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-new-york-city-at-night-41617-large.mp4',
  Rome: 'https://assets.mixkit.co/videos/preview/mixkit-colosseum-and-ancient-rome-at-sunset-41551-large.mp4',
  London: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-london-street-at-night-41604-large.mp4',
  Dubai: 'https://assets.mixkit.co/videos/preview/mixkit-burj-khalifa-tower-in-dubai-at-night-41550-large.mp4',
  Sydney: 'https://assets.mixkit.co/videos/preview/mixkit-sydney-opera-house-at-sunset-41549-large.mp4',
  Venice: 'https://assets.mixkit.co/videos/preview/mixkit-gondolas-floating-on-a-canal-in-venice-41607-large.mp4',
  Cairo: 'https://assets.mixkit.co/videos/preview/mixkit-pyramids-of-giza-in-egypt-at-sunset-41552-large.mp4',
  Rio: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-rio-de-janeiro-beach-41553-large.mp4',
  Barcelona: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-barcelona-cityscape-41605-large.mp4',
  Amsterdam: 'https://assets.mixkit.co/videos/preview/mixkit-canals-of-amsterdam-at-sunset-41606-large.mp4',
};

const DEFAULT_TRAILER = 'https://assets.mixkit.co/videos/preview/mixkit-eiffel-tower-in-paris-at-night-4228-large.mp4';

export const CitySearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearchParam = searchParams.get('search') || '';

  const [search, setSearch] = useState(urlSearchParam);
  const [regionFilter, setRegionFilter] = useState('');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularityScore');
  const [selectedCityModal, setSelectedCityModal] = useState(null);

  // Sync search state with URL parameter if present
  useEffect(() => {
    if (urlSearchParam) {
      setSearch(urlSearchParam);
    }
  }, [urlSearchParam]);

  // Fetch Cities with search & region parameters
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', search, regionFilter, sortBy],
    queryFn: async () => {
      const res = await cityApi.getCities({
        search,
        region: regionFilter,
        sortBy: sortBy === 'costLow' || sortBy === 'costHigh' ? 'costIndex' : sortBy,
        order: sortBy === 'costLow' ? 'asc' : 'desc',
      });
      return res.data.cities;
    },
  });

  // Auto-open target City Modal card when search parameter matches a city!
  useEffect(() => {
    if (urlSearchParam && cities.length > 0) {
      const match = cities.find(
        (c) =>
          c.name.toLowerCase() === urlSearchParam.toLowerCase() ||
          c.name.toLowerCase().includes(urlSearchParam.toLowerCase())
      );
      if (match) {
        setSelectedCityModal(match);
      }
    }
  }, [urlSearchParam, cities]);

  // Fetch detailed city with activities when modal is open
  const { data: detailedCity, isLoading: detailLoading } = useQuery({
    queryKey: ['cityDetail', selectedCityModal?.id],
    queryFn: async () => {
      const res = await cityApi.getCityById(selectedCityModal.id);
      return res.data.city;
    },
    enabled: !!selectedCityModal,
  });

  const handleCloseModal = () => {
    setSelectedCityModal(null);
    setSearch('');
    if (urlSearchParam) {
      navigate('/cities', { replace: true });
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    if (urlSearchParam) {
      navigate('/cities', { replace: true });
    }
  };

  const regions = [
    { label: 'All Regions', value: '' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia', value: 'Asia' },
    { label: 'North America', value: 'North America' },
    { label: 'Africa', value: 'Africa' },
    { label: 'Oceania', value: 'Oceania' },
    { label: 'South America', value: 'South America' },
  ];

  // Filter cities by cost index tier if selected
  const filteredCities = cities.filter((city) => {
    if (costFilter === 'budget') return city.costIndex <= 1.0;
    if (costFilter === 'moderate') return city.costIndex > 1.0 && city.costIndex <= 1.5;
    if (costFilter === 'premium') return city.costIndex > 1.5;
    return true;
  });

  const getCostIndexTierLabel = (costIndex) => {
    if (costIndex <= 1.0) return { label: 'Budget Friendly', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', tier: '$' };
    if (costIndex <= 1.5) return { label: 'Moderate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', tier: '$$' };
    return { label: 'Premium Destination', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', tier: '$$$' };
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-10 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-purple-950/30 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Global Destination Database & Video Trailers</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Discover Iconic <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">World Cities</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Experience HD video trailers of top destinations, popularity ratings, cost multipliers, and activity itineraries.
          </p>

          {/* Quick Stats Counter Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Globe className="w-4 h-4 text-brand-400" />
              <span><strong>16</strong> Cities Available</span>
            </div>
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Video className="w-4 h-4 text-pink-400" />
              <span><strong>HD Video</strong> Trailers Included</span>
            </div>
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span><strong>34+</strong> Curated Activities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
        {/* Search & Select Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city name, country, or region..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-xs"
            />
            {search && (
              <button onClick={handleClearSearch} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Cost Index Filter Tier */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl glass-input text-xs bg-slate-950 font-semibold"
            >
              <option value="all">All Cost Tiers</option>
              <option value="budget">Budget Friendly (≤ 1.0x)</option>
              <option value="moderate">Moderate (1.0x - 1.5x)</option>
              <option value="premium">Premium (&gt; 1.5x)</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl glass-input text-xs bg-slate-950 font-semibold"
            >
              <option value="popularityScore">Sort by Popularity (High to Low)</option>
              <option value="costLow">Sort by Cost (Low to High)</option>
              <option value="costHigh">Sort by Cost (High to Low)</option>
              <option value="name">Sort Alphabetically</option>
            </select>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {regions.map((reg) => (
            <button
              key={reg.label}
              onClick={() => setRegionFilter(reg.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                regionFilter === reg.value
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow border border-brand-400/40'
                  : 'glass-card text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Card Grid */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : filteredCities.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <Compass className="w-12 h-12 text-brand-400 mx-auto animate-bounce" />
          <h3 className="font-display font-extrabold text-xl text-white">No Cities Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing your search query or switching your region/cost filter.
          </p>
          <button
            onClick={handleClearSearch}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-glow"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCities.map((city) => {
            const costTier = getCostIndexTierLabel(city.costIndex);
            return (
              <div
                key={city.id}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-800/90 flex flex-col justify-between group shadow-xl"
              >
                {/* City Cover Image Container with Video Play Overlay */}
                <div className="h-52 relative overflow-hidden cursor-pointer" onClick={() => setSelectedCityModal(city)}>
                  <img
                    src={city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80'}
                    alt={city.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                  {/* Play Video Trailer Badge Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <div className="px-4 py-2 bg-gradient-to-r from-brand-600 to-pink-600 text-white text-xs font-extrabold rounded-2xl shadow-2xl flex items-center space-x-2 transform group-hover:scale-105 transition-transform border border-white/20">
                      <Play className="w-4 h-4 fill-white" />
                      <span>Watch Video Trailer</span>
                    </div>
                  </div>

                  {/* Popularity Badge */}
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-black rounded-xl border border-amber-500/30 flex items-center space-x-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{city.popularityScore}</span>
                  </span>

                  {/* Region Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-brand-300 text-[10px] font-bold uppercase rounded-xl border border-brand-500/30 tracking-wider">
                    {city.region}
                  </span>

                  {/* City Name & Country Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display font-black text-2xl text-white tracking-tight">{city.name}</h3>
                    <p className="text-xs text-slate-300 font-semibold flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>{city.country}</span>
                    </p>
                  </div>
                </div>

                {/* City Info Card Body */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Cost Tier Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${costTier.color}`}>
                        {costTier.label} ({costTier.tier})
                      </span>
                      <span className="text-slate-400 font-bold">Multiplier: <strong className="text-emerald-400">{city.costIndex}x</strong></span>
                    </div>

                    {/* Curated Activity Count */}
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center space-x-1.5 text-slate-400 font-medium">
                        <Ticket className="w-3.5 h-3.5 text-purple-400" />
                        <span>Curated Activities</span>
                      </span>
                      <span className="font-extrabold text-brand-400">{city._count?.activities || 0} Items</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCityModal(city)}
                      className="flex-1 py-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl transition-colors border border-slate-700/60 flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>View Trailer & Details</span>
                    </button>
                    <button
                      onClick={() => navigate('/trips/new')}
                      className="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow transition-all"
                      title="Plan trip featuring this city"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* City Detail & Live HD Video Trailer Preview Modal */}
      {selectedCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Live Cinematic HD Video Header */}
            <div className="relative h-60 flex-shrink-0 overflow-hidden bg-slate-950">
              <video
                src={CITY_VIDEO_TRAILERS[selectedCityModal.name] || DEFAULT_TRAILER}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

              {/* Video Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-brand-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-lg border border-white/20 tracking-wider">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Live Cinematic Teaser</span>
              </div>

              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 text-slate-300 hover:text-white rounded-full border border-slate-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                  <h3 className="font-display font-black text-3xl text-white drop-shadow-md">{selectedCityModal.name}</h3>
                  <p className="text-xs text-slate-200 font-bold flex items-center space-x-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedCityModal.country} • {selectedCityModal.region}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-500/90 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{selectedCityModal.popularityScore}</span>
                </span>
              </div>
            </div>

            {/* Modal Body Activities List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Curated Activities ({detailedCity?.activities?.length || 0})</span>
                </h4>
                <span className="text-xs text-emerald-400 font-bold">Cost Index: {selectedCityModal.costIndex}x</span>
              </div>

              {detailLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading city activities...</div>
              ) : (!detailedCity?.activities || detailedCity.activities.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No curated activities for this city yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailedCity.activities.map((act) => (
                    <div key={act.id} className="p-3 glass-card rounded-2xl border border-slate-800 flex items-center space-x-3 hover:border-slate-700 transition-colors">
                      {act.imageUrl && (
                        <img src={act.imageUrl} alt={act.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-white truncate">{act.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">{act.category} • {act.durationHours} hrs</p>
                        <p className="text-xs font-extrabold text-emerald-400 mt-1">{formatCurrency(act.estimatedCost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate('/trips/new');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow flex items-center space-x-1.5"
              >
                <span>Plan Trip with {selectedCityModal.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
