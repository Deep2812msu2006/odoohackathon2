import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { publicApi } from '../services/publicApi.js';
import { tripApi } from '../services/tripApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatDateRange, formatCurrency } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import { Copy, Calendar, MapPin, Ticket, User, Share2, Compass, CheckCircle2, ArrowRight, Globe, Lock } from 'lucide-react';

export const PublicTripPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trip, isLoading, error, refetch } = useQuery({
    queryKey: ['publicTrip', slug],
    queryFn: async () => {
      const res = await publicApi.getPublicTripBySlug(slug);
      return res.data?.trip || res.trip;
    },
    retry: 1,
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
      <div className="max-w-md mx-auto my-16 text-center glass-card rounded-3xl p-8 sm:p-10 space-y-5 border border-slate-800 shadow-2xl">
        <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl w-fit mx-auto border border-rose-500/20 shadow-glow">
          <Lock className="w-10 h-10 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-white">Trip Link Not Public Yet</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            This trip link is currently private. If you are the trip owner, make sure to enable public sharing in your trip builder!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/trips" className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors">
            My Trips
          </Link>
          <Link to="/" className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-glow transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      {/* Public Banner */}
      <div className="relative h-80 rounded-3xl overflow-hidden glass-card border border-slate-800/50 group">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute top-6 right-6">
          <span className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-xs rounded-full uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center space-x-2 backdrop-blur-sm">
            <Share2 className="w-4 h-4" />
            <span>Public Shared Trip</span>
          </span>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 mb-1 bg-slate-900/50 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl text-white drop-shadow-lg">{trip.name}</h1>
            <div className="flex items-center space-x-3 text-sm text-slate-200 bg-slate-900/50 backdrop-blur-sm rounded-xl px-4 py-2">
              <img
                src={trip.user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={trip.user?.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-brand-500/30"
              />
              <span>Planned by <strong className="text-white">{trip.user?.name}</strong></span>
              <span className="text-slate-500">•</span>
              <span className="text-brand-400 font-semibold flex items-center space-x-1">
                <Copy className="w-3.5 h-3.5" />
                <span>{trip._count?.originalShares || 0} copies made</span>
              </span>
            </div>
          </div>

          {/* Copy Trip CTA */}
          <div>
            {user ? (
              <button
                onClick={() => copyMutation.mutate()}
                disabled={copyMutation.isPending}
                className="px-8 py-4 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                <Copy className="w-5 h-5" />
                <span>{copyMutation.isPending ? 'Copying Trip...' : 'Copy Trip to My Account'}</span>
              </button>
            ) : (
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
              >
                <span>Sign Up to Copy This Itinerary</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800/50 text-sm text-slate-300 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
          <p className="font-semibold text-slate-400 mb-2 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-brand-400" />
            <span>Trip Overview:</span>
          </p>
          <p className="leading-relaxed">{trip.description}</p>
        </div>
      )}

      {/* Stops & Activities Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-2xl text-white flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-brand-400" />
            <span>Multi-City Itinerary ({trip.stops?.length || 0} Stops)</span>
          </h2>
        </div>

        {(trip.stops || []).map((stop, idx) => (
          <div key={stop.id} className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-white">{stop.city?.name} ({stop.city?.country})</h3>
                  <p className="text-sm text-slate-300 flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span className="font-medium">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Scheduled Activities */}
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <Ticket className="w-4 h-4 text-purple-400" />
                <span>Activities ({stop.stopActivities?.length || 0})</span>
              </h4>

              {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                <p className="text-sm text-slate-500 italic bg-slate-800/30 rounded-xl p-4 text-center">No scheduled activities for this stop.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stop.stopActivities.map((link) => (
                    <div key={link.id} className="p-4 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-brand-500/30 transition-all duration-300 group">
                      <div className="flex items-center space-x-4">
                        {link.activity?.imageUrl && (
                          <img src={link.activity.imageUrl} alt={link.activity.name} className="w-14 h-14 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300" />
                        )}
                        <div>
                          <p className="font-semibold text-sm text-white">{link.activity?.name}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(link.scheduledDate)} at {link.scheduledTime || '10:00'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-1.5">
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
