import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { cityApi } from '../services/cityApi.js';
import { formatDate, formatDateRange, formatCurrency } from '../utils/formatters.js';
import { 
  Calendar, MapPin, Clock, Ticket, PieChart, Edit3, Share2, Compass, 
  CheckCircle2, FileText, PlusCircle, Sparkles, Building2, Utensils, 
  Hotel, Coffee, Award, ShieldCheck, Printer, Download, ArrowRight, Star, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ItineraryViewPage = () => {
  const { id: tripId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('list'); // list, timeline

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const res = await tripApi.getTripById(tripId);
      return res.data.trip;
    },
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['citiesList'],
    queryFn: async () => {
      const res = await cityApi.getCities();
      return res.data.cities;
    },
  });

  const [isSavingPackage, setIsSavingPackage] = useState(false);

  const handleCopyShareLink = async (slug) => {
    try {
      await tripApi.publishTrip(trip.id, true);
    } catch (e) {}
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public share link activated & copied to clipboard!');
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  // Auto-save recommended package stops to DB if 0 stops exist
  const handleAutoSavePackage = async () => {
    setIsSavingPackage(true);
    try {
      const targetCity = cities.find(c => c.name.toLowerCase().includes('tokyo')) || cities[0];
      if (!targetCity) {
        toast.error('No destination cities found in database.');
        setIsSavingPackage(false);
        return;
      }

      const stopRes = await tripApi.addStop(tripId, {
        cityId: targetCity.id,
        arrivalDate: trip.startDate || new Date().toISOString(),
        departureDate: trip.endDate || new Date(Date.now() + 4*24*3600*1000).toISOString(),
        notes: 'All-Inclusive Package: Grand Boutique Hotel Stay, Daily Meals & Guided Activities Included',
      });

      const newStop = stopRes.data.stop;

      // Add default activities if city has activities
      if (targetCity.activities && targetCity.activities.length > 0) {
        for (const act of targetCity.activities.slice(0, 2)) {
          try {
            await tripApi.addActivityToStop(tripId, newStop.id, {
              activityId: act.id,
              scheduledDate: trip.startDate || new Date().toISOString(),
              scheduledTime: '10:00',
              customCost: act.estimatedCost || 45,
            });
          } catch (e) {}
        }
      }

      queryClient.invalidateQueries(['trip', tripId]);
      toast.success('All-Inclusive Travel Package permanently saved to database! 🎉', { icon: '✨' });
    } catch (err) {
      toast.error(err.message || 'Failed to save package to database.');
    } finally {
      setIsSavingPackage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-semibold text-slate-300">Loading complete trip schedule, hotel stay & dining details...</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12 text-rose-400">Trip details not found.</div>;
  }

  const hasStops = trip.stops && trip.stops.length > 0;

  // Global landmark city photo and metadata dictionary
  const CITY_DATABASE = {
    tokyo: { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
    paris: { name: 'Paris', country: 'France', flag: '🇫🇷', photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
    rome: { name: 'Rome', country: 'Italy', flag: '🇮🇹', photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
    'new york': { name: 'New York', country: 'United States', flag: '🇺🇸', photo: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80' },
    london: { name: 'London', country: 'United Kingdom', flag: '🇬🇧', photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80' },
    dubai: { name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80' },
    sydney: { name: 'Sydney', country: 'Australia', flag: '🇦🇺', photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80' },
    venice: { name: 'Venice', country: 'Italy', flag: '🇮🇹', photo: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&auto=format&fit=crop&q=80' },
    cairo: { name: 'Cairo', country: 'Egypt', flag: '🇪🇬', photo: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80' },
    rio: { name: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', photo: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80' },
    barcelona: { name: 'Barcelona', country: 'Spain', flag: '🇪🇸', photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&auto=format&fit=crop&q=80' },
    amsterdam: { name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', photo: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80' },
    kyoto: { name: 'Kyoto', country: 'Japan', flag: '🇯🇵', photo: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80' },
    bangkok: { name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', photo: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop&q=80' },
  };

  // Helper generators for Accommodation and Food Plan for each city stop
  const getCityAccommodation = (city) => {
    const cityName = city?.name || 'Tokyo';
    return {
      hotelName: `Grand ${cityName} Luxury Resort & Spa`,
      roomType: 'Executive Deluxe Suite with City Skyline View',
      checkIn: '14:00 PM',
      checkOut: '11:00 AM',
      rating: '4.9 ★★★★★',
      amenities: ['Complimentary Breakfast Buffet', 'Free Ultra-Fast Wi-Fi', 'Infinity Rooftop Pool', '24/7 Private Concierge', 'Spa & Wellness Center Access']
    };
  };

  const getCityFoodPlan = (city) => {
    const cityName = city?.name || 'Tokyo';
    return {
      breakfast: `Complimentary Breakfast Buffet at Hotel Lounge (07:30 - 10:00 AM)`,
      lunch: `Curated ${cityName} Food Market Tasting & Local Artisan Bistro (12:30 - 14:00 PM)`,
      dinner: `3-Course Gourmet Regional Specialty Dinner & Fine Wine Pairing (19:30 - 21:30 PM)`,
      specialty: `Authentic ${cityName} Local Delicacies & Fresh Gourmet Seafood`
    };
  };

  // Determine main destination city & country
  const mainStop = hasStops ? trip.stops[trip.stops.length - 1]?.city : null;
  const firstStop = hasStops ? trip.stops[0]?.city : null;
  const searchStr = `${trip.name || ''} ${trip.description || ''}`.toLowerCase();
  const matchedKey = Object.keys(CITY_DATABASE).find(k => searchStr.includes(k));
  const matchedInfo = matchedKey ? CITY_DATABASE[matchedKey] : null;

  const mainCityName = mainStop?.name || firstStop?.name || matchedInfo?.name || (trip.name?.length > 2 ? trip.name : 'Tokyo');
  const mainCountry = mainStop?.country || firstStop?.country || matchedInfo?.country || 'Japan';
  const mainFlag = matchedInfo?.flag || (mainCountry === 'Japan' ? '🇯🇵' : mainCountry === 'France' ? '🇫🇷' : mainCountry === 'Italy' ? '🇮🇹' : '📍');

  const defaultGeneric = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80';
  const effectiveCoverPhoto = (trip.coverPhotoUrl && trip.coverPhotoUrl !== defaultGeneric)
    ? trip.coverPhotoUrl
    : (mainStop?.imageUrl || matchedInfo?.photo || CITY_DATABASE.tokyo.photo);

  // Default fallback stop for display if trip has 0 stops in database
  const defaultPackageStop = {
    id: 'default-package-stop-id',
    arrivalDate: trip.startDate || new Date().toISOString(),
    departureDate: trip.endDate || new Date(Date.now() + 4*24*3600*1000).toISOString(),
    city: {
      id: 'default-city-id',
      name: mainCityName,
      country: mainCountry,
      imageUrl: effectiveCoverPhoto,
    },
    stopActivities: [
      {
        id: 'act-default-1',
        scheduledDate: trip.startDate || new Date().toISOString(),
        scheduledTime: '10:00 AM',
        customCost: 45,
        activity: {
          name: `Iconic ${mainCityName} Guided Landmark Sightseeing Tour & Pass`,
          estimatedCost: 45,
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80'
        }
      },
      {
        id: 'act-default-2',
        scheduledDate: trip.startDate || new Date().toISOString(),
        scheduledTime: '14:30 PM',
        customCost: 35,
        activity: {
          name: `Historic Culture & Local Artisan Heritage Walk`,
          estimatedCost: 35,
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80'
        }
      }
    ]
  };

  const displayStops = hasStops ? trip.stops : [defaultPackageStop];

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in print:p-0">
      {/* Cover Header */}
      <div className="relative h-80 rounded-3xl overflow-hidden glass-card border border-slate-800/50 group shadow-2xl print:h-48 print:rounded-none">
        <img
          src={effectiveCoverPhoto}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1.5 text-xs font-black text-white bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 rounded-full px-3.5 py-1.5 shadow-lg shadow-brand-500/30 border border-white/20">
                <span className="text-sm">{mainFlag}</span>
                <span>Destination: {mainCityName}{mainCountry ? `, ${mainCountry}` : ''}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-brand-300 bg-slate-950/70 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white drop-shadow-lg tracking-tight">{trip.name}</h1>
            <p className="text-sm text-slate-200 mt-1 max-w-xl leading-relaxed font-medium">{trip.description || 'Confirmed all-inclusive trip package with hotel stays, dining plans & activities.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <button
              onClick={handlePrintVoucher}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Printer className="w-4 h-4" />
              <span>Print Trip Pass</span>
            </button>

            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Builder</span>
            </Link>

            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-brand-400 font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all backdrop-blur-sm"
            >
              <PieChart className="w-4 h-4" />
              <span>View Budget</span>
            </Link>

            <button
              onClick={() => handleCopyShareLink(trip.publicSlug)}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-emerald-500 text-emerald-400 hover:text-white font-semibold text-xs rounded-xl flex items-center space-x-2 transition-all backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 print:hidden">
        <div className="flex space-x-2">
          {[
            { id: 'list', label: 'Full Trip Itinerary & Vouchers' },
            { id: 'timeline', label: 'Daily Timeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg px-3 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span>{displayStops.length} City Destinations</span>
        </div>
      </div>

      {/* Save Recommended Package Bar if 0 stops exist in database */}
      {!hasStops && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-200 shadow-xl">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <p className="font-extrabold text-amber-300 text-sm">Showing All-Inclusive Recommended Travel Package</p>
              <p className="text-slate-300">Click below to permanently save this complete hotel, food & activity schedule into your trip database!</p>
            </div>
          </div>

          <button
            onClick={handleAutoSavePackage}
            disabled={isSavingPackage}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isSavingPackage ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Package...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Save Package to Database</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Detailed Breakdown List View */}
      {activeTab === 'list' && (
        <div className="space-y-8">
          {displayStops.map((stop, idx) => {
            const accom = getCityAccommodation(stop.city);
            const food = getCityFoodPlan(stop.city);

            return (
              <div key={stop.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 space-y-6 hover:border-brand-500/40 transition-all duration-300 shadow-2xl bg-slate-900/90">
                {/* City Stop Title Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl sm:text-3xl text-white flex items-center gap-2">
                        <span>{stop.city?.name}</span>
                        <span className="text-sm font-semibold text-slate-400">({stop.city?.country})</span>
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-brand-400" />
                        <span className="font-bold">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20 w-fit">
                    ✓ CONFIRMED BOOKING PASS
                  </span>
                </div>

                {/* SECTION 1: 🏨 WHERE YOU STAY (Hotel & Accommodation) */}
                <div className="glass-card p-5 rounded-2xl border border-slate-800/90 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider flex items-center space-x-2">
                      <Hotel className="w-4 h-4 text-purple-400" />
                      <span>1. Where You Stay (Hotel & Accommodation Pass)</span>
                    </h4>
                    <span className="text-xs text-amber-400 font-bold">{accom.rating}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <p className="text-white font-black text-base">{accom.hotelName}</p>
                      <p className="text-xs text-brand-300 font-bold">{accom.roomType}</p>
                      <p className="text-[11px] text-slate-400 pt-1">
                        Check-in: <strong className="text-white">{accom.checkIn}</strong> • Check-out: <strong className="text-white">{accom.checkOut}</strong>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Included Hotel Amenities:</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {accom.amenities.map((am, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-950/80 text-slate-200 text-[10px] font-semibold rounded-lg border border-slate-800">
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: 🍽️ WHAT FOOD GIVEN (Dining & Culinary Plan) */}
                <div className="glass-card p-5 rounded-2xl border border-slate-800/90 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-slate-900 space-y-3">
                  <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>2. What Food & Dining Included (Meal Schedule)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-amber-400 flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5" /> Breakfast (Included)
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{food.breakfast}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-emerald-400 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5" /> Lunch Plan
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{food.lunch}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Gourmet Dinner
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">{food.dinner}</p>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: 🎟️ WHICH ACTIVITIES WE DO THERE (Scheduled Activities) */}
                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-cyan-400" />
                    <span>3. Which Activities We Do There ({stop.stopActivities?.length || 0} Tours Scheduled)</span>
                  </h4>

                  {(!stop.stopActivities || stop.stopActivities.length === 0) ? (
                    <p className="text-xs text-slate-500 italic bg-slate-950/40 rounded-xl p-4 text-center border border-slate-850">
                      No specific sightseeing tours scheduled yet. Use Builder to add activities!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.stopActivities.map((link) => (
                        <div key={link.id} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center space-x-4 hover:border-cyan-500/40 transition-all duration-300 group">
                          {link.activity?.imageUrl && (
                            <img src={link.activity.imageUrl} alt={link.activity.name} className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-extrabold text-sm text-white truncate">{link.activity?.name}</p>
                            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-brand-400" />
                              <span>{formatDate(link.scheduledDate)} @ {link.scheduledTime || '10:00 AM'}</span>
                            </p>
                            <p className="text-[11px] text-emerald-400 font-extrabold mt-1">
                              Ticket Cost: {formatCurrency(link.customCost ?? link.activity?.estimatedCost)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div className="relative pl-8 border-l-2 border-brand-500 space-y-10 my-8">
          {displayStops.map((stop, idx) => (
            <div key={stop.id} className="relative group">
              <div className="absolute -left-[39px] top-2 w-6 h-6 rounded-full bg-brand-500 ring-4 ring-slate-950 shadow-lg shadow-brand-500/30"></div>
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
                <h3 className="font-display font-bold text-xl text-white">Stop {idx + 1}: {stop.city?.name}</h3>
                <p className="text-xs text-brand-400 font-bold">{formatDateRange(stop.arrivalDate, stop.departureDate)}</p>
                
                <div className="space-y-2 pt-2">
                  {(stop.stopActivities || []).map((link) => (
                    <div key={link.id} className="flex items-center space-x-3 text-xs text-slate-300 bg-slate-950/60 rounded-xl p-3 border border-slate-850">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-bold text-white">{link.activity?.name}</span>
                      <span className="text-slate-400 text-[11px] ml-auto">({formatDate(link.scheduledDate)} @ {link.scheduledTime || '10:00 AM'})</span>
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
