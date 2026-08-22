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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">My Planned Trips</h1>
          <p className="text-sm text-slate-400">Manage your multi-city itineraries and shared links</p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm rounded-xl shadow-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'public', 'private'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterPublic(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterPublic === type
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:bg-slate-800'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-800">
              <div className="relative h-48 overflow-hidden group">
                <img
                  src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                {/* Status Badge */}
                <button
                  onClick={() => publishMutation.mutate({ id: trip.id, isPublic: !trip.isPublic })}
                  className={`absolute top-3 right-3 px-2.5 py-1 backdrop-blur-md text-[10px] font-bold uppercase rounded-lg tracking-wider border transition-all ${
                    trip.isPublic
                      ? 'bg-emerald-500/80 border-emerald-400 text-white'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Click to toggle public visibility"
                >
                  {trip.isPublic ? 'Public Share' : 'Private'}
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display font-bold text-lg text-white truncate">{trip.name}</h3>
                  <p className="text-xs text-slate-300 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-slate-400 line-clamp-2">{trip.description || 'No description added.'}</p>
                  
                  {/* Cities Stops Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(trip.stops || []).map((stop) => (
                      <span key={stop.id} className="px-2 py-0.5 bg-slate-800/90 text-slate-300 text-[11px] font-medium rounded-md border border-slate-700/80 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-brand-400" />
                        <span>{stop.city?.name}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-brand-400 rounded-lg transition-colors"
                      title="Edit Itinerary Builder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {trip.isPublic && (
                      <button
                        onClick={() => handleCopyShareLink(trip.publicSlug)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
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
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
