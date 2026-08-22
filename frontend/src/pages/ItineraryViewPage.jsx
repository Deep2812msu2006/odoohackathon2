import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { formatDate, formatDateRange, formatCurrency, getCategoryBadgeColor } from '../utils/formatters.js';
import { Calendar, MapPin, Clock, Ticket, PieChart, Edit3, Share2, Compass, CheckCircle2, FileText, PlusCircle, Sparkles } from 'lucide-react';
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

  const hasStops = trip.stops && trip.stops.length > 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Cover Header */}
      <div className="relative h-72 rounded-3xl overflow-hidden glass-card border border-slate-800/50 group">
        <img
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 mb-1 bg-slate-900/50 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
              <Calendar className="w-4 h-4" />
              <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl text-white drop-shadow-lg">{trip.name}</h1>
            <p className="text-sm text-slate-200 mt-1 max-w-xl leading-relaxed">{trip.description || 'No description added.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Builder</span>
            </Link>

            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-brand-400 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
            >
              <PieChart className="w-4 h-4" />
              <span>View Budget</span>
            </Link>

            {trip.isPublic && (
              <button
                onClick={() => handleCopyShareLink(trip.publicSlug)}
                className="px-4 py-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 hover:text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Link</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-3">
        <div className="flex space-x-2">
          {['list', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {tab} View
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span>{trip.stops?.length || 0} City Stops</span>
        </div>
      </div>

      {/* Empty State Callout Banner if No City Stops Added */}
      {!hasStops ? (
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-purple-950/40 text-center space-y-5 shadow-2xl">
          <div className="p-4 bg-brand-500/10 text-brand-400 rounded-2xl w-fit mx-auto border border-brand-500/20 shadow-glow">
            <Compass className="w-10 h-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">Your Itinerary Has No City Stops Yet!</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              You've created the trip container <strong>"{trip.name}"</strong>. Now add your destination cities and curated activities to build your daily travel schedule!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-glow flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add City Stops in Builder</span>
            </Link>
            <Link
              to="/cities"
              className="px-6 py-3 bg-slate-800/90 hover:bg-slate-700 text-brand-300 font-bold text-xs rounded-2xl border border-slate-700/60 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore World Cities & Activities</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* List View */}
          {activeTab === 'list' && (
            <div className="space-y-6">
              {trip.stops.map((stop, idx) => (
                <div key={stop.id} className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white font-bold text-base flex items-center justify-center shadow-lg shadow-brand-500/30">
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

                  {stop.notes && (
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                      <p className="text-sm text-slate-300 italic flex items-start space-x-2">
                        <FileText className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                        <span>{stop.notes}</span>
                      </p>
                    </div>
                  )}

                  {/* Activities */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-purple-400" />
                      <span>Activities ({stop.stopActivities?.length || 0})</span>
                    </h4>
                    {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                      <p className="text-sm text-slate-500 italic bg-slate-800/30 rounded-xl p-4 text-center">No scheduled activities for this stop.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stop.stopActivities.map((link) => (
                          <div key={link.id} className="p-4 bg-gradient-to-br from-slate-900/60 to-slate-800/40 rounded-2xl border border-slate-800 flex items-center space-x-4 hover:border-brand-500/30 transition-all duration-300 group">
                            {link.activity?.imageUrl && (
                              <img src={link.activity.imageUrl} alt={link.activity.name} className="w-14 h-14 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-white truncate">{link.activity?.name}</p>
                              <p className="text-xs text-slate-400 mt-1">
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
            <div className="relative pl-8 border-l-2 border-gradient-to-b from-brand-500 to-brand-400 space-y-10 my-8">
              {trip.stops.map((stop, idx) => (
                <div key={stop.id} className="relative group">
                  <div className="absolute -left-[39px] top-2 w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 ring-4 ring-slate-950 shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-4 hover:border-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-display font-bold text-xl text-white">Stop {idx + 1}: {stop.city?.name}</h3>
                        <span className="text-xs text-brand-400 font-semibold mt-1 inline-block bg-brand-500/10 rounded-lg px-2 py-1">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {(stop.stopActivities || []).map((link) => (
                        <div key={link.id} className="flex items-center space-x-3 text-sm text-slate-300 bg-slate-800/30 rounded-xl p-3 hover:bg-slate-800/50 transition-colors">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <span className="font-medium text-white">{link.activity?.name}</span>
                          <span className="text-slate-500 text-xs ml-auto">({formatDate(link.scheduledDate)} @ {link.scheduledTime || '10:00'})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
