import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '../services/publicApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatDateRange, formatCurrency } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import { Copy, Calendar, MapPin, Ticket, User, Share2, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const PublicTripPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copying, setCopying] = useState(false);

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['publicTrip', slug],
    queryFn: async () => {
      const res = await publicApi.getPublicTripBySlug(slug);
      return res.data.trip;
    },
  });

  const copyMutation = useMutation({
    mutationFn: () => publicApi.copyTrip(slug),
    onSuccess: (res) => {
      toast.success('Trip copied to your account! Opening your editable copy...');
      navigate(`/trips/${res.data.trip.id}/builder`);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to copy trip.');
    },
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400">Loading public trip itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto my-16 text-center glass-card rounded-3xl p-8 space-y-4 border border-slate-800">
        <Compass className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="font-display font-bold text-xl text-white">Trip Not Found or Private</h2>
        <p className="text-xs text-slate-400">This trip link may be invalid or the creator has unshared it.</p>
        <Link to="/" className="inline-block px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Public Banner */}
      <div className="relative h-72 rounded-3xl overflow-hidden glass-card border border-slate-800">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-emerald-500/90 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-lg flex items-center space-x-1">
            <Share2 className="w-3.5 h-3.5" />
            <span>Public Shared Trip</span>
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-white">{trip.name}</h1>
            <div className="flex items-center space-x-2 mt-2 text-xs text-slate-300">
              <img
                src={trip.user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={trip.user?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span>Planned by <strong className="text-white">{trip.user?.name}</strong></span>
              <span>•</span>
              <span className="text-brand-400 font-semibold">{trip._count?.originalShares || 0} copies made</span>
            </div>
          </div>

          {/* Copy Trip CTA */}
          <div>
            {user ? (
              <button
                onClick={() => copyMutation.mutate()}
                disabled={copyMutation.isPending}
                className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm rounded-2xl shadow-glow flex items-center space-x-2 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <Copy className="w-4 h-4" />
                <span>{copyMutation.isPending ? 'Copying Trip...' : 'Copy Trip to My Account'}</span>
              </button>
            ) : (
              <Link
                to="/signup"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-glow flex items-center space-x-2"
              >
                <span>Sign Up to Copy This Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 text-sm text-slate-300">
          <p className="font-semibold text-slate-400 mb-1">Trip Overview:</p>
          <p>{trip.description}</p>
        </div>
      )}

      {/* Stops & Activities Section */}
      <div className="space-y-6">
        <h2 className="font-display font-bold text-xl text-white">Multi-City Itinerary ({trip.stops?.length || 0} Stops)</h2>

        {(trip.stops || []).map((stop, idx) => (
          <div key={stop.id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-500/20 text-brand-400 font-bold text-base flex items-center justify-center border border-brand-500/30">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{stop.city?.name} ({stop.city?.country})</h3>
                  <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-400" />
                    <span>{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduled Activities */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Ticket className="w-4 h-4 text-purple-400" />
                <span>Activities ({stop.stopActivities?.length || 0})</span>
              </h4>

              {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No scheduled activities for this stop.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stop.stopActivities.map((link) => (
                    <div key={link.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {link.activity?.imageUrl && (
                          <img src={link.activity.imageUrl} alt={link.activity.name} className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-sm text-white">{link.activity?.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(link.scheduledDate)} at {link.scheduledTime || '10:00'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {formatCurrency(link.customCost ?? link.activity?.estimatedCost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
