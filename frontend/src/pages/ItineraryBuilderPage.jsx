import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { tripApi } from '../services/tripApi.js';
import { cityApi } from '../services/cityApi.js';
import { activityApi } from '../services/activityApi.js';
import { formatDate, formatDateRange, formatCurrency, getCategoryBadgeColor } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import {
  GripVertical, Plus, Calendar, MapPin, Ticket, Trash2, DollarSign,
  ArrowRight, Check, X, Search, Clock, AlertCircle, Compass, PieChart, ShieldCheck, Sparkles, CheckCircle2, CreditCard
} from 'lucide-react';

export const ItineraryBuilderPage = () => {
  const { id: tripId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modals state
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [selectedStopForActivity, setSelectedStopForActivity] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('processing');

  const handleInitiatePayment = () => {
    setShowPaymentModal(true);
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      toast.success('Payment of $499.00 processed successfully!', { icon: '💳' });
    }, 1300);
  };

  // Add stop form state
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopArrival, setStopArrival] = useState('');
  const [stopDeparture, setStopDeparture] = useState('');
  const [stopNotes, setStopNotes] = useState('');

  // Add activity form state
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategory, setActivityCategory] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [actSchedDate, setActSchedDate] = useState('');
  const [actSchedTime, setActSchedTime] = useState('10:00');
  const [actCustomCost, setActCustomCost] = useState('');

  // Fetch Trip Details
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const res = await tripApi.getTripById(tripId);
      return res.data.trip;
    },
  });

  // Fetch Cities for Add Stop Modal
  const { data: cities = [] } = useQuery({
    queryKey: ['cities', citySearch],
    queryFn: async () => {
      const res = await cityApi.getCities({ search: citySearch });
      return res.data.cities;
    },
    enabled: addStopModalOpen,
  });

  // Fetch Activities for Add Activity Modal
  const { data: activities = [] } = useQuery({
    queryKey: ['activities', selectedStopForActivity?.cityId, activitySearch, activityCategory],
    queryFn: async () => {
      const res = await activityApi.getActivities({
        cityId: selectedStopForActivity?.cityId,
        search: activitySearch,
        category: activityCategory,
      });
      return res.data.activities;
    },
    enabled: addActivityModalOpen && !!selectedStopForActivity,
  });

  // Add Stop Mutation
  const addStopMutation = useMutation({
    mutationFn: (data) => tripApi.addStop(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('City stop added to itinerary!');
      setAddStopModalOpen(false);
      resetStopForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to add stop.'),
  });

  // Reorder Stops Mutation
  const reorderMutation = useMutation({
    mutationFn: (stopsArray) => tripApi.reorderStops(tripId, stopsArray),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('Stop order updated.');
    },
  });

  // Delete Stop Mutation
  const deleteStopMutation = useMutation({
    mutationFn: (stopId) => tripApi.deleteStop(tripId, stopId),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('Stop removed.');
    },
  });

  // Add Activity Link Mutation
  const addActivityMutation = useMutation({
    mutationFn: ({ stopId, data }) => tripApi.addActivityToStop(tripId, stopId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('Activity scheduled!');
      setAddActivityModalOpen(false);
      resetActivityForm();
    },
    onError: (err) => toast.error(err.message || 'Failed to schedule activity.'),
  });

  // Delete Activity Link Mutation
  const deleteActivityLinkMutation = useMutation({
    mutationFn: ({ stopId, linkId }) => tripApi.removeActivityLink(tripId, stopId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('Activity removed.');
    },
  });

  const resetStopForm = () => {
    setSelectedCity(null);
    setCitySearch('');
    setStopArrival('');
    setStopDeparture('');
    setStopNotes('');
  };

  const resetActivityForm = () => {
    setSelectedActivity(null);
    setActivitySearch('');
    setActivityCategory('');
    setActSchedDate('');
    setActSchedTime('10:00');
    setActCustomCost('');
  };

  // Drag and Drop End Handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(trip.stops);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const payload = items.map((stop, idx) => ({
      id: stop.id,
      orderIndex: idx,
    }));

    queryClient.setQueryData(['trip', tripId], (old) => {
      if (!old) return old;
      return {
        ...old,
        stops: items.map((s, idx) => ({ ...s, orderIndex: idx })),
      };
    });

    reorderMutation.mutate(payload);
  };

  const handleAddStopSubmit = (e) => {
    e.preventDefault();
    if (!selectedCity) {
      toast.error('Please select a city.');
      return;
    }
    addStopMutation.mutate({
      cityId: selectedCity.id,
      arrivalDate: stopArrival,
      departureDate: stopDeparture,
      notes: stopNotes,
    });
  };

  const handleAddActivitySubmit = (e) => {
    e.preventDefault();
    if (!selectedActivity || !selectedStopForActivity) {
      toast.error('Please select an activity.');
      return;
    }
    addActivityMutation.mutate({
      stopId: selectedStopForActivity.id,
      data: {
        activityId: selectedActivity.id,
        scheduledDate: actSchedDate,
        scheduledTime: actSchedTime,
        customCost: actCustomCost ? parseFloat(actCustomCost) : selectedActivity.estimatedCost,
      },
    });
  };

  if (tripLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-400">Loading Itinerary Builder Workspace...</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12 text-rose-400 font-bold">Trip not found.</div>;
  }

  const totalActivitiesCount = (trip.stops || []).reduce((acc, stop) => acc + (stop.stopActivities?.length || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Workspace Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-brand-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Itinerary Workspace</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold">• {formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">{trip.name}</h1>
          <p className="text-xs text-slate-300">{trip.description || 'Drag and drop stops to reorder your multi-city journey.'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-brand-400 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700/60"
          >
            <PieChart className="w-4 h-4" />
            <span>Budget Engine</span>
          </Link>
          <Link
            to={`/trips/${trip.id}`}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all border border-slate-700/60"
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </Link>
          <button
            onClick={() => setAddStopModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow flex items-center space-x-1.5 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add City Stop</span>
          </button>
          <button
            onClick={handleInitiatePayment}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-emerald-500/25 flex items-center space-x-2 transition-all transform hover:scale-105"
            title="Make payment & complete itinerary booking"
          >
            <CreditCard className="w-4 h-4 text-emerald-100 animate-pulse" />
            <span>Make Payment & Finish ($499)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Stops List */}
      {trip.stops.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-5 border border-slate-800 shadow-xl">
          <div className="w-16 h-16 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center mx-auto border border-brand-500/20">
            <MapPin className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="font-display font-extrabold text-2xl text-white">No City Stops Added Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Build your multi-city journey by adding your first destination stop (e.g. Paris, Tokyo, Rome), or click finish to complete your payment & booking.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setAddStopModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-sm rounded-xl shadow-glow inline-flex items-center space-x-2 transition-transform transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Stop</span>
            </button>
            <button
              onClick={handleInitiatePayment}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white font-extrabold text-sm rounded-xl border border-emerald-400/40 inline-flex items-center space-x-2 transition-transform transform hover:scale-105 shadow-xl shadow-emerald-500/25"
            >
              <CreditCard className="w-4 h-4 text-white animate-pulse" />
              <span>Make Payment & Finish ($499)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stops-list">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {trip.stops.map((stop, index) => (
                  <Draggable key={stop.id} draggableId={stop.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`glass-card rounded-3xl p-6 border transition-all duration-200 ${
                          snapshot.isDragging
                            ? 'border-brand-500 ring-4 ring-brand-500/20 shadow-2xl scale-[1.01] bg-slate-900'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Stop Card Top Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center space-x-4">
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 text-slate-500 hover:text-brand-400 cursor-grab active:cursor-grabbing rounded-xl hover:bg-slate-800/80 transition-colors"
                              title="Drag to reorder stop"
                            >
                              <GripVertical className="w-6 h-6" />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-purple-600/30 text-brand-300 border border-brand-500/40 font-display font-black text-xl flex items-center justify-center shadow-inner">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-display font-extrabold text-2xl text-white">{stop.city?.name}</h3>
                                <span className="text-xs font-semibold text-slate-400">({stop.city?.country})</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 mt-1">
                                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                                <span>{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedStopForActivity(stop);
                                setActSchedDate(stop.arrivalDate.split('T')[0]);
                                setAddActivityModalOpen(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-brand-500/20 to-purple-500/20 hover:from-brand-500/30 hover:to-purple-500/30 text-brand-300 border border-brand-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Schedule Activity</span>
                            </button>

                            <button
                              onClick={() => deleteStopMutation.mutate(stop.id)}
                              className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                              title="Delete Stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {stop.notes && (
                          <div className="mt-4 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                            <strong className="text-slate-400">Stop Notes:</strong> {stop.notes}
                          </div>
                        )}

                        {/* Activities List under Stop */}
                        <div className="mt-5 space-y-3 pt-4 border-t border-slate-800/80">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                            <Ticket className="w-4 h-4 text-purple-400" />
                            <span>Scheduled Activities ({stop.stopActivities?.length || 0})</span>
                          </h4>

                          {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                            <p className="text-xs text-slate-500 italic pl-2">No activities scheduled for this stop yet.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {stop.stopActivities.map((link) => (
                                <div
                                  key={link.id}
                                  className="p-3.5 glass-card rounded-2xl border border-slate-800 flex items-center justify-between hover:border-brand-500/40 transition-all shadow-md"
                                >
                                  <div className="flex items-center space-x-3 overflow-hidden">
                                    {link.activity?.imageUrl && (
                                      <img
                                        src={link.activity.imageUrl}
                                        alt={link.activity.name}
                                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-700"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <h5 className="font-bold text-sm text-white truncate">{link.activity?.name}</h5>
                                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${getCategoryBadgeColor(link.activity?.category)}`}>
                                          {link.activity?.category}
                                        </span>
                                        <span className="flex items-center space-x-1 text-slate-300 font-medium">
                                          <Clock className="w-3 h-3 text-brand-400" />
                                          <span>{formatDate(link.scheduledDate)} @ {link.scheduledTime || '10:00'}</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3 ml-3 flex-shrink-0">
                                    <span className="text-xs font-extrabold text-emerald-400">
                                      {formatCurrency(link.customCost !== null ? link.customCost : link.activity?.estimatedCost)}
                                    </span>
                                    <button
                                      onClick={() => deleteActivityLinkMutation.mutate({ stopId: stop.id, linkId: link.id })}
                                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add City Stop Modal */}
      {addStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-800 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-display font-bold text-xl text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                <span>Add Destination Stop to Itinerary</span>
              </h3>
              <button onClick={() => setAddStopModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Search & Select City
                </label>
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Type city name or country (e.g. Paris, Tokyo)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-800 rounded-2xl p-2 bg-slate-950/80">
                  {cities.map((city) => (
                    <div
                      key={city.id}
                      onClick={() => setSelectedCity(city)}
                      className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all ${
                        selectedCity?.id === city.id
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <MapPin className="w-4 h-4 text-brand-400" />
                        <span className="font-semibold">{city.name}</span>
                        <span className="text-slate-500">({city.country})</span>
                      </div>
                      {selectedCity?.id === city.id && <Check className="w-4 h-4 text-brand-400" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    required
                    min={trip.startDate.split('T')[0]}
                    max={trip.endDate.split('T')[0]}
                    value={stopArrival}
                    onChange={(e) => setStopArrival(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    min={stopArrival || trip.startDate.split('T')[0]}
                    max={trip.endDate.split('T')[0]}
                    value={stopDeparture}
                    onChange={(e) => setStopDeparture(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Stop Notes (Optional)
                </label>
                <input
                  type="text"
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  placeholder="e.g. Hotel recommendations or flight details"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddStopModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStopMutation.isPending || !selectedCity}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs rounded-xl shadow-glow disabled:opacity-50"
                >
                  {addStopMutation.isPending ? 'Adding Stop...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {addActivityModalOpen && selectedStopForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-800 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Schedule Activity for {selectedStopForActivity.city?.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scheduled date between {formatDateRange(selectedStopForActivity.arrivalDate, selectedStopForActivity.departureDate)}
                </p>
              </div>
              <button onClick={() => setAddActivityModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddActivitySubmit} className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search city activities..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 border border-slate-800 rounded-2xl p-2 bg-slate-950/80">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-500 p-4 text-center">No activities found for this city.</p>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className={`p-3 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-all ${
                        selectedActivity?.id === act.id
                          ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 font-bold'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {act.imageUrl && (
                          <img src={act.imageUrl} alt={act.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700" />
                        )}
                        <div>
                          <p className="font-bold text-white">{act.name}</p>
                          <p className="text-[10px] text-slate-400">{act.category} • {act.durationHours} hrs</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-emerald-400">{formatCurrency(act.estimatedCost)}</p>
                        {selectedActivity?.id === act.id && <Check className="w-4 h-4 text-brand-400 ml-auto" />}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    min={selectedStopForActivity.arrivalDate.split('T')[0]}
                    max={selectedStopForActivity.departureDate.split('T')[0]}
                    value={actSchedDate}
                    onChange={(e) => setActSchedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Time (e.g. 10:00)
                  </label>
                  <input
                    type="time"
                    value={actSchedTime}
                    onChange={(e) => setActSchedTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Custom Cost ($ USD, optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={selectedActivity ? `Default: $${selectedActivity.estimatedCost}` : '0.00'}
                  value={actCustomCost}
                  onChange={(e) => setActCustomCost(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddActivityModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addActivityMutation.isPending || !selectedActivity}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs rounded-xl shadow-glow disabled:opacity-50"
                >
                  {addActivityMutation.isPending ? 'Scheduling...' : 'Schedule Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-6 text-center bg-slate-950 relative overflow-hidden">
            {paymentStep === 'processing' ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-display font-extrabold text-xl text-white">Processing Instant Payment...</h3>
                <p className="text-xs text-slate-400">Verifying payment details & securing hotel reservations for {trip.name}...</p>
              </div>
            ) : (
              <div className="space-y-6 animate-scale-up">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 ring-8 ring-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Payment Successful 💳
                  </span>
                  <h3 className="font-display font-black text-2xl text-white">Booking Completed!</h3>
                  <p className="text-xs text-slate-400">
                    Your payment of <strong className="text-emerald-400">$499.00 USD</strong> has been successfully processed.
                  </p>
                </div>

                {/* Receipt Details */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Ref:</span>
                    <span className="font-mono font-bold text-white">#TXN-984210</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Trip Itinerary:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">{trip.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Destinations:</span>
                    <span className="font-bold text-emerald-400">{(trip.stops || []).length} City Stops</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-transform transform hover:scale-105"
                >
                  <span>View Boarding Passes & Trip Summary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
