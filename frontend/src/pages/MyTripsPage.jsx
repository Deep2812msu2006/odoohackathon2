import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tripApi } from '../services/tripApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { formatDateRange } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import { Plus, Search, Calendar, MapPin, Share2, Trash2, Edit3, Eye, Copy } from 'lucide-react';

export const MyTripsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterPublic, setFilterPublic] = useState('all'); // all, public, private
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await tripApi.getUserTrips();
      return res.data.trips;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tripApi.deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['trips']);
      toast.success('Trip deleted successfully.');
      setDeleteModalOpen(false);
      setSelectedTrip(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete trip.');
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublic }) => tripApi.publishTrip(id, isPublic),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['trips']);
      toast.success(`Trip ${variables.isPublic ? 'published' : 'unpublished'}.`);
    },
  });

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.name.toLowerCase().includes(search.toLowerCase()) ||
      (trip.description && trip.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPublic =
      filterPublic === 'all' ? true : filterPublic === 'public' ? trip.isPublic : !trip.isPublic;
    return matchesSearch && matchesPublic;
  });

  const handleCopyShareLink = (slug) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public share link copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-4xl text-white bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent">
            My Planned Trips
          </h1>
          <p className="text-sm text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span>Manage your multi-city itineraries and shared links</span>
          </p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 transform hover:scale-105 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by name or description..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['all', 'public', 'private'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterPublic(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                filterPublic === type
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
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
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/50 group hover:border-brand-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Status Badge */}
                <button
                  onClick={() => publishMutation.mutate({ id: trip.id, isPublic: !trip.isPublic })}
                  className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-xl text-[11px] font-bold uppercase rounded-xl tracking-wider border transition-all duration-300 ${
                    trip.isPublic
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-300 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                  title="Click to toggle public visibility"
                >
                  {trip.isPublic ? 'Public Share' : 'Private'}
                </button>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display font-bold text-xl text-white truncate drop-shadow-lg">{trip.name}</h3>
                  <p className="text-xs text-slate-200 flex items-center space-x-2 mt-1.5 bg-slate-900/50 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <span className="font-medium">{formatDateRange(trip.startDate, trip.endDate)}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900/50 to-slate-800/30">
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{trip.description || 'No description added.'}</p>
                  
                  {/* Cities Stops Badges */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(trip.stops || []).map((stop) => (
                      <span key={stop.id} className="px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-700/50 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/50 flex items-center space-x-1.5 hover:border-brand-500/50 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-brand-400" />
                        <span>{stop.city?.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-brand-500 hover:to-brand-400 text-brand-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                      title="Edit Itinerary Builder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {trip.isPublic && (
                      <button
                        onClick={() => handleCopyShareLink(trip.publicSlug)}
                        className="p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                        title="Copy Public Link"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2.5 text-rose-400 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
