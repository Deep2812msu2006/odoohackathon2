import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { tripApi } from '../services/tripApi.js';
import { formatDateRange } from '../utils/formatters.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import toast from 'react-hot-toast';
import { 
  Plus, Calendar, MapPin, Share2, Trash2, Edit3, Eye, Search, Filter, Compass, Sparkles, Globe, Heart, ArrowRight
} from 'lucide-react';

export const MyTripsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, public, private
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['myTrips'],
    queryFn: async () => {
      const res = await tripApi.getUserTrips();
      return res.data.trips;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tripApi.deleteTrip(id),
    onSuccess: () => {
      toast.success('Trip deleted successfully');
      queryClient.invalidateQueries(['myTrips']);
      setDeleteModalOpen(false);
      setSelectedTrip(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete trip');
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublic }) => tripApi.publishTrip(id, isPublic),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries(['myTrips']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update visibility');
    },
  });

  const handleCopyShareLink = (slug) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard! 🚀');
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.stops?.some(s => s.city?.name?.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filterType === 'public') return t.isPublic;
    if (filterType === 'private') return !t.isPublic;
    return true;
  });

  // Global landmark city photo dictionary
  const CITY_PHOTOS = {
    tokyo: { cityName: 'Tokyo', country: 'Japan', flag: '🇯🇵', photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
    paris: { cityName: 'Paris', country: 'France', flag: '🇫🇷', photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
    rome: { cityName: 'Rome', country: 'Italy', flag: '🇮🇹', photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
    'new york': { cityName: 'New York', country: 'United States', flag: '🇺🇸', photo: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80' },
    london: { cityName: 'London', country: 'United Kingdom', flag: '🇬🇧', photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80' },
    dubai: { cityName: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80' },
    sydney: { cityName: 'Sydney', country: 'Australia', flag: '🇦🇺', photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80' },
    venice: { cityName: 'Venice', country: 'Italy', flag: '🇮🇹', photo: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&auto=format&fit=crop&q=80' },
    cairo: { cityName: 'Cairo', country: 'Egypt', flag: '🇪🇬', photo: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80' },
    rio: { cityName: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', photo: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80' },
    barcelona: { cityName: 'Barcelona', country: 'Spain', flag: '🇪🇸', photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80' },
    amsterdam: { cityName: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', photo: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80' },
    kyoto: { cityName: 'Kyoto', country: 'Japan', flag: '🇯🇵', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80' },
  };

  const getTripMainDestination = (trip) => {
    const mainStop = (trip.stops && trip.stops.length > 0) ? trip.stops[trip.stops.length - 1]?.city : null;
    const firstStop = (trip.stops && trip.stops.length > 0) ? trip.stops[0]?.city : null;
    const searchStr = `${trip.name || ''} ${trip.description || ''}`.toLowerCase();
    const matchedKey = Object.keys(CITY_PHOTOS).find(k => searchStr.includes(k));
    const matchedInfo = matchedKey ? CITY_PHOTOS[matchedKey] : null;

    const cityName = mainStop?.name || firstStop?.name || matchedInfo?.cityName || (trip.name?.length > 2 ? trip.name : 'Tokyo');
    const country = mainStop?.country || firstStop?.country || matchedInfo?.country || 'Japan';
    const flag = matchedInfo?.flag || (country === 'Japan' ? '🇯🇵' : country === 'France' ? '🇫🇷' : country === 'Italy' ? '🇮🇹' : '📍');
    
    const defaultGeneric = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80';
    const photo = (trip.coverPhotoUrl && trip.coverPhotoUrl !== defaultGeneric)
      ? trip.coverPhotoUrl
      : (mainStop?.imageUrl || matchedInfo?.photo || CITY_PHOTOS.tokyo.photo);

    return { cityName, country, flag, photo };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-card border border-brand-500/30 p-8 md:p-12 bg-gradient-to-br from-slate-950 via-slate-900/90 to-brand-950/40 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 text-[11px] font-bold uppercase tracking-wider rounded-xl px-3.5 py-1.5 w-fit border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-City Travel Experiences</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-white tracking-tight">
              My Planned <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Itineraries</span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Manage your upcoming adventures, customize city stops, assign daily activities, and share interactive links with fellow travelers.
            </p>
          </div>

          <Link
            to="/trips/new"
            className="group relative inline-flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-brand-500/30 transition-all duration-300 transform hover:scale-105 overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Plus className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Create New Trip</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trip title or destination..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {['all', 'public', 'private'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-glow'
                    : 'glass-card text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : filteredTrips.length === 0 ? (
        <EmptyState
          title={search ? "No matching trips found" : "No trips planned yet"}
          description={search ? "Try adjusting your search query." : "Start planning your first multi-city itinerary!"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => {
            const dest = getTripMainDestination(trip);
            return (
              <div key={trip.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/50 group hover:border-brand-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 transform hover:-translate-y-2">
                {/* Visual Cover with Enhanced Effects */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.photo}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80"></div>
                  
                  {/* Main Destination Badge */}
                  <div className="absolute top-4 left-4 flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950/85 backdrop-blur-xl text-white text-[11px] font-black rounded-xl border border-white/20 shadow-xl z-10">
                    <span className="text-sm">{dest.flag}</span>
                    <span>{dest.cityName}{dest.country ? `, ${dest.country}` : ''}</span>
                  </div>
                
                  {/* Status Badge with Pulse Animation */}
                  <button
                    onClick={() => publishMutation.mutate({ id: trip.id, isPublic: !trip.isPublic })}
                    className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-xl text-[11px] font-bold uppercase rounded-xl tracking-wider border transition-all duration-300 transform hover:scale-105 ${
                      trip.isPublic
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-300 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
                        : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                    title="Click to toggle public visibility"
                  >
                    {trip.isPublic ? 'Public Share' : 'Private'}
                  </button>

                  {/* Trip Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">
                        {(trip.stops || []).length} {(trip.stops || []).length === 1 ? ' City' : ' Cities'}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-bold text-2xl text-white truncate drop-shadow-lg leading-tight">{trip.name}</h3>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2 bg-slate-950/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-slate-700/50">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-xs font-medium text-slate-200">{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Content Section */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900/60 to-slate-800/40 backdrop-blur-xl">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{trip.description || 'No description added.'}</p>
                    
                    {/* Cities Stops Badges with Enhanced Styling */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(trip.stops || []).slice(0, 4).map((stop, idx) => (
                        <span 
                          key={stop.id} 
                          className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center space-x-1.5 transition-all duration-300 transform hover:scale-105 ${
                            idx === 0 
                              ? 'bg-gradient-to-r from-brand-500/20 to-brand-400/10 text-brand-300 border-brand-500/30' 
                              : 'bg-gradient-to-r from-slate-800 to-slate-700/50 text-slate-200 border-slate-700/50 hover:border-brand-500/30'
                          }`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{stop.city?.name}</span>
                        </span>
                      ))}
                      {(trip.stops || []).length > 4 && (
                        <span className="px-3 py-1.5 bg-slate-800/50 text-slate-400 text-xs font-medium rounded-xl border border-slate-700/50">
                          +{(trip.stops || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Actions Footer */}
                  <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/trips/${trip.id}/builder`}
                        className="group relative p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-brand-500 hover:to-brand-400 text-brand-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-brand-500/20"
                        title="Edit Itinerary Builder"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        <Edit3 className="w-4 h-4 relative z-10" />
                      </Link>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="group relative p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {trip.isPublic && (
                        <button
                          onClick={() => handleCopyShareLink(trip.publicSlug)}
                          className="group relative p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-emerald-500/20"
                          title="Copy Public Link"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                          <Share2 className="w-4 h-4 relative z-10" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTrip(trip);
                        setDeleteModalOpen(true);
                      }}
                      className="group relative p-2.5 text-rose-400 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-rose-500/20"
                      title="Delete Trip"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <Trash2 className="w-4 h-4 relative z-10" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTrip(null);
        }}
        onConfirm={() => selectedTrip && deleteMutation.mutate(selectedTrip.id)}
        title="Delete Trip?"
        message={`Are you sure you want to delete "${selectedTrip?.name}"? All associated stops, scheduled activities, and public links will be permanently deleted.`}
        confirmText="Delete Trip"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};
