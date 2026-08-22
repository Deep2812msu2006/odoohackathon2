import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { formatDate, formatDateRange, formatCurrency, getCategoryBadgeColor } from '../utils/formatters.js';
import { Calendar, MapPin, Clock, Ticket, PieChart, Edit3, Share2, Compass, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ItineraryViewPage = () => {
  const { id: tripId } = useParams();
  const [activeTab, setActiveTab] = useState('list'); // list, timeline, calendar

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const res = await tripApi.getTripById(tripId);
      return res.data.trip;
    },
  });

  const handleCopyShareLink = (slug) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public share link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-2">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12 text-rose-400">Trip not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Cover Header */}
      <div className="relative h-64 rounded-3xl overflow-hidden glass-card border border-slate-800">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl text-white">{trip.name}</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{trip.description || 'No description added.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-glow flex items-center space-x-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Builder</span>
            </Link>

            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-brand-400 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <PieChart className="w-4 h-4" />
              <span>View Budget</span>
            </Link>

            {trip.isPublic && (
              <button
                onClick={() => handleCopyShareLink(trip.publicSlug)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex space-x-2">
          {['list', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} View
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">{trip.stops?.length || 0} City Stops</span>
      </div>

      {/* List View */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {(trip.stops || []).map((stop, idx) => (
            <div key={stop.id} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{stop.city?.name} ({stop.city?.country})</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {stop.notes && <p className="text-xs text-slate-300 italic">Notes: {stop.notes}</p>}

              {/* Activities */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activities:</h4>
                {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                  <p className="text-xs text-slate-500 italic">No scheduled activities for this stop.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stop.stopActivities.map((link) => (
                      <div key={link.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center space-x-3">
                        {link.activity?.imageUrl && (
                          <img src={link.activity.imageUrl} alt={link.activity.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs text-white truncate">{link.activity?.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {formatDate(link.scheduledDate)} at {link.scheduledTime || '10:00'} • {formatCurrency(link.customCost ?? link.activity?.estimatedCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div className="relative pl-6 border-l-2 border-brand-500/40 space-y-8 my-6">
          {(trip.stops || []).map((stop, idx) => (
            <div key={stop.id} className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-slate-950"></div>
              <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-lg text-white">Stop {idx + 1}: {stop.city?.name}</h3>
                  <span className="text-xs text-brand-400 font-semibold">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                </div>

                <div className="space-y-2 pt-2">
                  {(stop.stopActivities || []).map((link) => (
                    <div key={link.id} className="flex items-center space-x-3 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-medium text-white">{link.activity?.name}</span>
                      <span className="text-slate-500">({formatDate(link.scheduledDate)} @ {link.scheduledTime || '10:00'})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
