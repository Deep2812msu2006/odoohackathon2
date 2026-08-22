import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { cityApi } from '../services/cityApi.js';
import { formatDate, formatDateRange, formatCurrency } from '../utils/formatters.js';
import { 
  Calendar, MapPin, Clock, Ticket, PieChart, Edit3, Share2, Compass, 
  CheckCircle2, FileText, PlusCircle, Sparkles, Building2, Utensils, 
  Hotel, Coffee, Award, ShieldCheck, Printer, Plane, Key, QrCode, Zap, ExternalLink, Navigation, DollarSign, CreditCard, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ItineraryViewPage = () => {
  const { id: tripId } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('vouchers'); // vouchers, days, list, timeline
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('processing');
  const [isPaid, setIsPaid] = useState(false);

  const handleInitiatePayment = () => {
    setShowPaymentModal(true);
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      setIsPaid(true);
      toast.success('Payment of $499.00 processed successfully! All reservations & passes locked in.', { icon: '💳' });
    }, 1400);
  };

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

  // Single Direct PDF Save Trigger
  const handlePrintVoucher = () => {
    setActiveTab('vouchers');
    toast.success('Opening print dialog... Select "Save as PDF" to download your complete pass!', { icon: '📄' });
    setTimeout(() => {
      window.print();
    }, 250);
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
        notes: 'All-Inclusive Package: Grand Hotel Stay, Boarding Passes, Meals & Guided Tours Included',
      });

      const newStop = stopRes.data.stop;

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
      toast.success('All-Inclusive Travel Package & Boarding Passes saved! 🎉', { icon: '✈️' });
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
        <p className="font-semibold text-slate-300">Generating attractive boarding passes, hotel vouchers & day-by-day plan...</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12 text-rose-400">Trip details not found.</div>;
  }

  const hasStops = trip.stops && trip.stops.length > 0;

  // Global landmark city photo and metadata dictionary
  const CITY_DATABASE = {
    tokyo: { name: 'Tokyo', country: 'Japan', code: 'TYO', flag: '🇯🇵', photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
    paris: { name: 'Paris', country: 'France', code: 'PAR', flag: '🇫🇷', photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
    rome: { name: 'Rome', country: 'Italy', code: 'ROM', flag: '🇮🇹', photo: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
    'new york': { name: 'New York', country: 'United States', code: 'NYC', flag: '🇺🇸', photo: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80' },
    london: { name: 'London', country: 'United Kingdom', code: 'LON', flag: '🇬🇧', photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80' },
    dubai: { name: 'Dubai', country: 'United Arab Emirates', code: 'DXB', flag: '🇦🇪', photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80' },
    sydney: { name: 'Sydney', country: 'Australia', code: 'SYD', flag: '🇦🇺', photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80' },
  };

  const getCityAccommodation = (city) => {
    const cityName = city?.name || 'Tokyo';
    return {
      hotelName: `Grand ${cityName} Luxury Resort & Spa`,
      roomType: 'Executive Deluxe Suite with City Skyline View',
      roomNo: 'Suite 1402',
      checkIn: '14:00 PM',
      checkOut: '11:00 AM',
      confirmationNo: `HTL-889-${Math.floor(1000 + Math.random() * 9000)}`,
      rating: '4.9 ★★★★★',
      amenities: ['Complimentary Breakfast Buffet', 'Free Ultra-Fast Wi-Fi', 'Infinity Rooftop Pool', '24/7 Private Concierge', 'Spa Access']
    };
  };

  const getCityFoodPlan = (city) => {
    const cityName = city?.name || 'Tokyo';
    return {
      voucherId: `MEAL-441-${Math.floor(1000 + Math.random() * 9000)}`,
      breakfast: `Complimentary Breakfast Buffet at Hotel Lounge (07:30 - 10:00 AM)`,
      lunch: `Curated ${cityName} Food Market Tasting & Local Artisan Bistro (12:30 - 14:00 PM)`,
      dinner: `3-Course Gourmet Regional Specialty Dinner & Fine Wine Pairing (19:30 - 21:30 PM)`,
    };
  };

  const mainStop = hasStops ? trip.stops[trip.stops.length - 1]?.city : null;
  const firstStop = hasStops ? trip.stops[0]?.city : null;
  const searchStr = `${trip.name || ''} ${trip.description || ''}`.toLowerCase();
  const matchedKey = Object.keys(CITY_DATABASE).find(k => searchStr.includes(k));
  const matchedInfo = matchedKey ? CITY_DATABASE[matchedKey] : null;

  const mainCityName = mainStop?.name || firstStop?.name || matchedInfo?.name || (trip.name?.length > 2 ? trip.name : 'Tokyo');
  const mainCountry = mainStop?.country || firstStop?.country || matchedInfo?.country || 'Japan';
  const mainFlag = matchedInfo?.flag || (mainCountry === 'Japan' ? '🇯🇵' : mainCountry === 'France' ? '🇫🇷' : mainCountry === 'Italy' ? '🇮🇹' : '📍');
  const mainCode = matchedInfo?.code || mainCityName.substring(0, 3).toUpperCase();

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
          name: `Historic Culture & Local Heritage Guided Walk`,
          estimatedCost: 35,
          imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80'
        }
      }
    ]
  };

  const displayStops = hasStops ? trip.stops : [defaultPackageStop];

  // Calculate total days count of the trip (e.g. 4 days, 7 days, 10 days)
  const calculateTotalDays = (start, end) => {
    if (!start || !end) return 4;
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 4;
  };

  const totalDaysCount = calculateTotalDays(trip.startDate, trip.endDate);

  // Extract all saved activities from all stops in database
  const allDbActivities = displayStops.flatMap(stop => stop.stopActivities || []);

  // Master Day-by-Day Tourist Plan Generator for N Days (Day 1 to Day N)
  const generateDayByDaySchedule = (stopsList, totalDays, startDateStr) => {
    const schedule = [];
    const baseDate = startDateStr ? new Date(startDateStr) : new Date();

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + (dayNum - 1));
      const formattedDayDate = currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      // Associate with city stop in sequence or cycle
      const stopIndex = (dayNum - 1) % (stopsList.length || 1);
      const currentStop = stopsList[stopIndex] || displayStops[0];
      const cityName = currentStop.city?.name || mainCityName;
      const countryName = currentStop.city?.country || mainCountry;

      const hotelName = `Grand ${cityName} Luxury Resort & Spa`;
      const hotelAddress = `Central Luxury Boulevard, ${cityName}, ${countryName}`;
      const hotelBookingLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelName + ' ' + cityName)}`;

      const isoDate = currentDate.toISOString().split('T')[0];

      // Match activities saved in database for this specific day date or city stop
      const dayDbActivities = allDbActivities.filter(actLink => {
        if (actLink.scheduledDate) {
          const actIso = new Date(actLink.scheduledDate).toISOString().split('T')[0];
          if (actIso === isoDate) return true;
        }
        // Fallback: if single stop trip and 1 day, match all stop activities
        if (displayStops.length === 1 && totalDays === 1) return true;
        return false;
      });

      const extraActivitiesCost = dayDbActivities.reduce((sum, item) => {
        return sum + (Number(item.customCost ?? item.activity?.estimatedCost) || 0);
      }, 0);

      // Distinct daily activities
      const morningActivities = [
        `Arrival & Airport Chauffeur Transfer to ${hotelName} (Welcome Drinks & Priority Suite Keys)`,
        `Guided Landmark Sightseeing Tour of ${cityName} (Panoramic Skydeck Pass Included)`,
        `Historic Cultural Temple & Monument Guided Walking Tour`,
        `Scenic River & Old Town Coastal Morning Tour`,
        `Artisan Quarter Walk & Local Heritage Discovery`
      ];

      const afternoonActivities = [
        `Gourmet Local Food Market Tasting & Artisan Bistro Lunch`,
        `Famous Fine Art Museum & Heritage Gallery Guided Visit`,
        `Panoramic Skydeck Observatory & City Landmark Photo Stop`,
        `Luxury Promenade Shopping & High-End Boutique Tour`,
        `Botanical Gardens & Botanical Heritage Stroll`
      ];

      const eveningActivities = [
        `3-Course Regional Specialty Dinner & Fine Wine Pairing`,
        `Sunset Skyline Cruise & Evening City Illumination Walk`,
        `Traditional Cultural Performance & Gala Dinner Night`,
        `Rooftop Cocktail Tasting & Night City View`,
        `Chef's Table Gourmet Culinary Dining Experience`
      ];

      schedule.push({
        dayNumber: dayNum,
        dateStr: formattedDayDate,
        isoDate,
        cityName,
        countryName,
        hotelName,
        hotelAddress,
        hotelBookingLink,
        roomType: 'Executive Deluxe Suite with City Skyline View',
        checkIn: '14:00 PM',
        checkOut: '11:00 AM',
        morning: morningActivities[(dayNum - 1) % morningActivities.length],
        afternoon: afternoonActivities[(dayNum - 1) % afternoonActivities.length],
        evening: eveningActivities[(dayNum - 1) % eveningActivities.length],
        dayDbActivities,
        extraActivitiesCost,
        dailyBudget: {
          stay: 140,
          food: 65,
          activities: 45,
          transport: 20,
          extra: extraActivitiesCost,
          total: 270 + extraActivitiesCost
        }
      });
    }
    return schedule;
  };

  const dayByDayPlan = generateDayByDaySchedule(displayStops, totalDaysCount, trip.startDate);
  const totalTripCalculatedBudget = dayByDayPlan.reduce((sum, d) => sum + d.dailyBudget.total, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in print:p-0 print:m-0">
      {/* Cover Header */}
      <div className="relative h-80 rounded-3xl overflow-hidden glass-card border border-slate-800/50 group shadow-2xl print:hidden">
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
                <span>{formatDateRange(trip.startDate, trip.endDate)} ({totalDaysCount} Days)</span>
              </div>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white drop-shadow-lg tracking-tight">{trip.name}</h1>
            <p className="text-sm text-slate-200 mt-1 max-w-xl leading-relaxed font-medium">{trip.description || 'Confirmed all-inclusive trip package with vehicle boarding passes, hotel room vouchers, dining plans & day-by-day plan.'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* MAKE FINAL PAYMENT BUTTON */}
            <button
              onClick={handleInitiatePayment}
              className={`px-6 py-3.5 text-white font-black text-sm rounded-2xl shadow-xl flex items-center space-x-2.5 transition-all transform hover:scale-105 ${
                isPaid
                  ? 'bg-emerald-600/90 border border-emerald-400/50 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-emerald-500/30 ring-4 ring-emerald-500/20'
              }`}
            >
              <CreditCard className="w-5 h-5 text-emerald-200 animate-pulse" />
              <span>{isPaid ? '✓ Paid & Confirmed ($499)' : '💳 Make Final Payment ($499)'}</span>
            </button>

            {/* MAIN DIRECT PRINT / SAVE PDF PASS BUTTON */}
            <button
              onClick={handlePrintVoucher}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-brand-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm rounded-2xl shadow-xl flex items-center space-x-2.5 transition-all transform hover:scale-105"
            >
              <Printer className="w-5 h-5" />
              <span>Print / Direct Save PDF Pass</span>
            </button>

            <Link
              to={`/trips/${trip.id}/builder`}
              className="px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-xs rounded-2xl border border-slate-700/60 flex items-center space-x-2 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Builder</span>
            </Link>

            <Link
              to={`/trips/${trip.id}/budget`}
              className="px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-brand-400 font-semibold text-xs rounded-2xl flex items-center space-x-2 transition-all"
            >
              <PieChart className="w-4 h-4" />
              <span>View Budget</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'vouchers', label: '🎫 Boarding Passes & Vouchers' },
            { id: 'days', label: `🗓️ Day-by-Day Plan (${totalDaysCount} Days)` },
            { id: 'list', label: '📋 Detailed Itinerary' },
            { id: 'timeline', label: '⏱️ Daily Timeline' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-500 via-purple-600 to-cyan-500 text-white shadow-lg shadow-brand-500/30 border border-white/20 scale-105'
                  : 'bg-slate-950/90 text-slate-100 border border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-slate-500 shadow-md'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-200 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2">
          <MapPin className="w-4 h-4 text-brand-400" />
          <span>{displayStops.length} Destinations</span>
        </div>
      </div>

      {/* Save Recommended Package Bar if 0 stops exist in database */}
      {!hasStops && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-200 shadow-xl print:hidden">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <p className="font-extrabold text-amber-300 text-sm">Showing Official Travel Boarding Passes & Vouchers</p>
              <p className="text-slate-300">Click to save this complete travel package and flight/hotel tickets into your database!</p>
            </div>
          </div>

          <button
            onClick={handleAutoSavePackage}
            disabled={isSavingPackage}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 shrink-0 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isSavingPackage ? (
              <span>Saving Package...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Save Tickets to Database</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 1: 🎫 BOARDING PASSES & TRAVEL VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-8 print:space-y-6">
          <div className="text-center space-y-1 print:hidden">
            <h2 className="font-display font-black text-2xl text-white">Official Trip Boarding Passes & Reservation Vouchers</h2>
            <p className="text-xs text-slate-400">Present these digital or printed barcodes at airport gates, hotel reception & activity entrances</p>
          </div>

          {displayStops.map((stop, idx) => {
            const accom = getCityAccommodation(stop.city);
            const food = getCityFoodPlan(stop.city);
            const cityCode = stop.city?.name ? stop.city.name.substring(0, 3).toUpperCase() : 'TYO';

            return (
              <div key={stop.id} className="space-y-6 print:space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-slate-400">
                  <h3 className="font-display font-black text-xl text-white flex items-center space-x-2 print:text-slate-900">
                    <span className="text-brand-400 print:text-slate-900">Destination {idx + 1}:</span>
                    <span>{stop.city?.name} ({stop.city?.country})</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-bold print:text-slate-700">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                </div>

                {/* 1. ✈️ VEHICLE / FLIGHT & EXPRESS TRAIN BOARDING PASS */}
                <div className="printable-stub glass-card rounded-3xl overflow-hidden border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950/40 shadow-2xl break-inside-avoid page-break-inside-avoid">
                  <div className="bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-600 p-4 text-white flex items-center justify-between print:bg-slate-900 print:text-white">
                    <div className="flex items-center space-x-3">
                      <Plane className="w-6 h-6 animate-pulse" />
                      <div>
                        <p className="font-black text-sm tracking-wider uppercase">Globetrotter Sky & Rail Express</p>
                        <p className="text-[10px] opacity-90">Vehicle / Flight Boarding Pass • Ticket GT-842</p>
                      </div>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase">
                      FIRST CLASS VVIP
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center print:p-4 print:gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Origin / Route</p>
                      <p className="font-black text-2xl text-white print:text-slate-900">HOME ➔ {cityCode}</p>
                      <p className="text-xs text-brand-300 font-semibold print:text-slate-700">{stop.city?.name}, {stop.city?.country}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Boarding & Departure</p>
                      <p className="font-extrabold text-base text-emerald-400 print:text-emerald-700">{formatDate(stop.arrivalDate)}</p>
                      <p className="text-xs text-slate-300 print:text-slate-800">Boarding Time: <strong>08:30 AM</strong></p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Seat & Gate Assignment</p>
                      <p className="font-black text-xl text-amber-400 print:text-amber-700">GATE B14 • SEAT 12A</p>
                      <p className="text-xs text-slate-400 print:text-slate-700">Passenger: <strong className="text-white print:text-slate-900">Trip Booker</strong></p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1 print:bg-slate-100 print:border-slate-400">
                      <div className="font-mono text-xs font-black tracking-widest text-slate-300 print:text-slate-900 select-all">
                        ||| | |||| ||||| || |||| |||
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 print:text-slate-700 uppercase tracking-wider">PNR: GT-{Math.floor(100000 + Math.random() * 900000)}</p>
                    </div>
                  </div>
                </div>

                {/* 2. 🏨 HOTEL ROOM & ACCOMMODATION BOARDING VOUCHER */}
                <div className="printable-stub glass-card rounded-3xl overflow-hidden border border-purple-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 shadow-2xl break-inside-avoid page-break-inside-avoid">
                  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-4 text-white flex items-center justify-between print:bg-purple-900 print:text-white">
                    <div className="flex items-center space-x-3">
                      <Hotel className="w-6 h-6" />
                      <div>
                        <p className="font-black text-sm tracking-wider uppercase">{accom.hotelName}</p>
                        <p className="text-[10px] opacity-90">Official Hotel Room Voucher • Ref: {accom.confirmationNo}</p>
                      </div>
                    </div>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase">
                      CONFIRMED ROOM STAY
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center print:p-4 print:gap-3">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Reserved Room Suite</p>
                      <p className="font-black text-lg text-white print:text-slate-900">{accom.roomNo}</p>
                      <p className="text-xs text-purple-300 font-semibold print:text-purple-800">{accom.roomType}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Check-in / Check-out</p>
                      <p className="text-xs text-slate-200 print:text-slate-800">Check-in: <strong className="text-emerald-400 print:text-emerald-700">{accom.checkIn}</strong></p>
                      <p className="text-xs text-slate-200 print:text-slate-800">Check-out: <strong className="text-rose-400 print:text-rose-700">{accom.checkOut}</strong></p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 print:text-slate-600">Keycard Perks Included</p>
                      <p className="text-xs text-slate-300 print:text-slate-800">✓ Free Wi-Fi • Rooftop Pool • Spa</p>
                      <p className="text-xs text-amber-400 font-bold print:text-amber-700">{accom.rating}</p>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-1 print:bg-slate-100 print:border-slate-400">
                      <Key className="w-5 h-5 text-purple-400 print:text-purple-700 mx-auto" />
                      <p className="font-mono text-[10px] font-bold text-slate-300 print:text-slate-900">KEYCARD VOUCHER</p>
                      <p className="text-[9px] text-slate-500 print:text-slate-700 font-bold">SCAN AT RECEPTION DESK</p>
                    </div>
                  </div>
                </div>

                {/* 3. 🍽️ ALL-INCLUSIVE DINING & CULINARY PASS STUB */}
                <div className="printable-stub glass-card rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 shadow-2xl break-inside-avoid page-break-inside-avoid">
                  <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 p-4 text-slate-950 flex items-center justify-between print:bg-amber-100 print:text-slate-950">
                    <div className="flex items-center space-x-3">
                      <Utensils className="w-6 h-6" />
                      <div>
                        <p className="font-black text-sm tracking-wider uppercase">VIP Gourmet Dining & Meal Pass</p>
                        <p className="text-[10px] font-bold opacity-90">Voucher ID: {food.voucherId}</p>
                      </div>
                    </div>
                    <span className="bg-slate-950/20 px-3 py-1 rounded-full text-xs font-black uppercase">
                      ALL-INCLUSIVE MEAL PLAN
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 print:p-4 print:gap-3">
                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                      <p className="text-xs font-bold text-amber-400 print:text-amber-700">🥐 Breakfast Lounge Access</p>
                      <p className="text-[11px] text-slate-300 print:text-slate-800 leading-relaxed">{food.breakfast}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                      <p className="text-xs font-bold text-emerald-400 print:text-emerald-700">🍕 Food Market Lunch Tour</p>
                      <p className="text-[11px] text-slate-300 print:text-slate-800 leading-relaxed">{food.lunch}</p>
                    </div>

                    <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1 print:bg-white print:border-slate-300">
                      <p className="text-xs font-bold text-purple-400 print:text-purple-700">🍷 3-Course Gourmet Dinner</p>
                      <p className="text-[11px] text-slate-300 print:text-slate-800 leading-relaxed">{food.dinner}</p>
                    </div>
                  </div>
                </div>

                {/* 4. 🎟️ SIGHTSEEING ATTRACTION & ACTIVITY TICKETS */}
                <div className="space-y-3 pt-2 print:space-y-2">
                  <h4 className="font-display font-bold text-sm text-cyan-300 print:text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Ticket className="w-4 h-4 text-cyan-400 print:text-cyan-700" />
                    <span>Attraction & Sightseeing Entrance Tickets ({stop.stopActivities?.length || 0})</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
                    {(stop.stopActivities || []).map((link, actIdx) => (
                      <div key={link.id} className="printable-stub glass-card rounded-2xl p-5 border border-cyan-500/30 bg-slate-950/90 flex items-center justify-between gap-4 break-inside-avoid page-break-inside-avoid print:bg-white print:border-slate-300">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-300 print:text-cyan-800 rounded-full text-[10px] font-black border border-cyan-500/20">
                            FASTTRACK ENTRY PASS #{actIdx + 1}
                          </span>
                          <p className="font-extrabold text-sm text-white print:text-slate-900 truncate">{link.activity?.name}</p>
                          <p className="text-xs text-slate-300 print:text-slate-800">Date: <strong>{formatDate(link.scheduledDate)}</strong> @ <strong>{link.scheduledTime || '10:00 AM'}</strong></p>
                          <p className="text-[11px] text-emerald-400 print:text-emerald-700 font-bold">Ticket Value: {formatCurrency(link.customCost ?? link.activity?.estimatedCost)}</p>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-center shrink-0 print:bg-slate-100 print:border-slate-300">
                          <QrCode className="w-8 h-8 text-cyan-400 print:text-slate-900 mx-auto" />
                          <p className="font-mono text-[8px] text-slate-400 print:text-slate-700 font-bold mt-1">GT-ACT-{Math.floor(1000 + Math.random() * 9000)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: 🗓️ MASTER DAY-BY-DAY TOURIST PLAN (EXACT DETAILS FOR N DAYS WITH HOTEL PREVIEW & BUDGET) */}
      {activeTab === 'days' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
            <div className="space-y-1">
              <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
                <span>🗓️ Complete Day-by-Day Master Tourist Itinerary</span>
                <span className="text-xs text-brand-400 font-extrabold bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
                  {totalDaysCount} Days Planned
                </span>
              </h2>
              <p className="text-xs text-slate-300">Detailed schedule for every single day: hotel links, morning/afternoon/evening visits & daily costs</p>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-right space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Calculated {totalDaysCount}-Day Budget</p>
              <p className="font-display font-black text-2xl text-emerald-400">{formatCurrency(totalTripCalculatedBudget)}</p>
              <p className="text-[10px] text-slate-500">Average: $270.00 / day</p>
            </div>
          </div>

          <div className="space-y-6">
            {dayByDayPlan.map((day) => (
              <div key={day.dayNumber} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 space-y-6 hover:border-brand-500/40 transition-all shadow-2xl bg-slate-900/90">
                {/* Day Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-600 to-cyan-500 text-white font-black text-base flex items-center justify-center shadow-lg shadow-brand-500/30">
                      Day {day.dayNumber}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl text-white flex items-center gap-2">
                        <span>{day.cityName}</span>
                        <span className="text-sm text-slate-400 font-semibold">({day.countryName})</span>
                      </h3>
                      <p className="text-xs text-brand-300 font-bold flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        <span>{day.dateStr}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-slate-400 text-[10px] font-bold uppercase block">Day {day.dayNumber} Total</span>
                      <span className="font-black text-emerald-400 text-sm">{formatCurrency(day.dailyBudget.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Hotel Preview & Location Section */}
                <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-slate-950 to-slate-900 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                      <h4 className="text-xs font-black uppercase text-purple-300 flex items-center space-x-2">
                        <Hotel className="w-4 h-4 text-purple-400" />
                        <span>Where Tourist Stays (Hotel & Suite Info)</span>
                      </h4>
                      <p className="text-white font-black text-base mt-1">{day.hotelName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span>{day.hotelAddress}</span>
                      </p>
                    </div>

                    <a
                      href={day.hotelBookingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs rounded-xl border border-purple-500/40 flex items-center space-x-2 transition-all w-fit shrink-0 shadow-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>🌐 Preview Hotel & Location Map</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Room Category</span>
                      <span className="font-extrabold text-white text-[11px]">{day.roomType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Check-in</span>
                      <span className="font-bold text-emerald-400 text-[11px]">{day.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Check-out</span>
                      <span className="font-bold text-rose-400 text-[11px]">{day.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Hotel Stay Cost</span>
                      <span className="font-extrabold text-purple-400 text-[11px]">{formatCurrency(day.dailyBudget.stay)}</span>
                    </div>
                  </div>
                </div>

                {/* Where Tourist Goes Today: Morning, Afternoon, Evening Schedule with Activity Photos */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-black uppercase text-cyan-300 flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      <span>Where Tourist Goes (Full Day Schedule & Experience Photos)</span>
                    </h4>

                    {/* Action Buttons to Browse & Add Activities or Food to Trip with Auto Date & Place pre-fill */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/activities?tripId=${trip.id}&category=sightseeing&date=${day.isoDate}&time=09:30&place=${encodeURIComponent(day.cityName)}`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-extrabold text-[11px] rounded-xl shadow-lg flex items-center space-x-1.5 transition-all transform hover:scale-105"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Browse & Add Extra Activity</span>
                      </Link>

                      <Link
                        to={`/activities?tripId=${trip.id}&category=food&date=${day.isoDate}&time=12:30&place=${encodeURIComponent(day.cityName)}`}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-[11px] rounded-xl shadow-lg flex items-center space-x-1.5 transition-all transform hover:scale-105"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Browse & Add Food Experience</span>
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Morning Card with HD Photo */}
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 group hover:border-amber-500/40 transition-all">
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&auto=format&fit=crop&q=80" 
                          alt="Morning Tour" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-amber-500/90 text-slate-950 font-black text-[10px] rounded-md">
                          08:30 AM • SIGHTSEEING
                        </span>
                      </div>
                      <p className="font-extrabold text-white text-xs leading-snug">{day.morning}</p>
                      <p className="text-[11px] text-amber-400 font-bold">Included Tour Pass: $45.00</p>
                    </div>

                    {/* Afternoon Card with HD Photo */}
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 group hover:border-emerald-500/40 transition-all">
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80" 
                          alt="Afternoon Food Tour" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500/90 text-slate-950 font-black text-[10px] rounded-md">
                          12:30 PM • LUNCH & DINING
                        </span>
                      </div>
                      <p className="font-extrabold text-white text-xs leading-snug">{day.afternoon}</p>
                      <p className="text-[11px] text-emerald-400 font-bold">Food Market Tasting: $65.00</p>
                    </div>

                    {/* Evening Card with HD Photo */}
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 group hover:border-purple-500/40 transition-all">
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80" 
                          alt="Evening Gourmet Dinner" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-purple-500/90 text-white font-black text-[10px] rounded-md">
                          19:30 PM • GOURMET DINNER
                        </span>
                      </div>
                      <p className="font-extrabold text-white text-xs leading-snug">{day.evening}</p>
                      <p className="text-[11px] text-purple-400 font-bold">Chef's Table Dining: Included</p>
                    </div>
                  </div>
                </div>

                {/* Booked Extra Activities & Food Experiences Added from Database */}
                {day.dayDbActivities && day.dayDbActivities.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase text-emerald-300 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>Booked Extra Experiences & Food Tours ({day.dayDbActivities.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.dayDbActivities.map((actLink, actIdx) => {
                        const actObj = actLink.activity || {};
                        const costVal = actLink.customCost ?? actObj.estimatedCost;
                        return (
                          <div key={actLink.id || actIdx} className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 flex items-center space-x-4 shadow-xl">
                            <img
                              src={actObj.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'}
                              alt={actObj.name}
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-emerald-500/30"
                            />
                            <div className="space-y-1 flex-1 min-w-0">
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md text-[9px] font-black uppercase">
                                {actObj.category || 'FOOD'} • {actLink.scheduledTime || '12:30'}
                              </span>
                              <p className="font-extrabold text-white text-sm truncate">{actObj.name}</p>
                              <p className="text-[11px] text-slate-300 font-medium line-clamp-1">{actObj.description || 'Added to your itinerary schedule.'}</p>
                              <p className="text-xs font-black text-emerald-400 pt-0.5">
                                Extra Ticket Value: +{formatCurrency(costVal)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Day N Expense Breakdown Bar */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-slate-300">Day {day.dayNumber} Estimated Expenses:</span>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-slate-400">Hotel: <strong className="text-white">{formatCurrency(day.dailyBudget.stay)}</strong></span>
                    <span className="text-slate-400">Food: <strong className="text-white">{formatCurrency(day.dailyBudget.food)}</strong></span>
                    <span className="text-slate-400">Activities: <strong className="text-white">{formatCurrency(day.dailyBudget.activities)}</strong></span>
                    <span className="text-slate-400">Transport: <strong className="text-white">{formatCurrency(day.dailyBudget.transport)}</strong></span>
                    {day.dailyBudget.extra > 0 && (
                      <span className="text-emerald-300 font-extrabold bg-emerald-500/20 px-2.5 py-1 rounded-xl border border-emerald-500/40 shadow-sm">
                        Booked Extra: +{formatCurrency(day.dailyBudget.extra)}
                      </span>
                    )}
                    <span className="text-emerald-400 font-black text-sm bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                      Day Total: {formatCurrency(day.dailyBudget.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DETAILED ITINERARY LIST */}
      {activeTab === 'list' && (
        <div className="space-y-8">
          {displayStops.map((stop, idx) => {
            const accom = getCityAccommodation(stop.city);

            return (
              <div key={stop.id} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 space-y-6 shadow-2xl bg-slate-900/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-purple-600 to-cyan-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                        {stop.city?.name} ({stop.city?.country})
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-brand-400" />
                        <span className="font-bold">{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-800/90 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-slate-900 space-y-3">
                  <p className="text-xs font-black uppercase text-purple-300">1. Where You Stay (Hotel & Accommodation Pass)</p>
                  <p className="text-white font-black text-base">{accom.hotelName}</p>
                  <p className="text-xs text-brand-300 font-bold">{accom.roomType}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: DAILY TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="relative pl-8 border-l-2 border-brand-500 space-y-10 my-8">
          {displayStops.map((stop, idx) => (
            <div key={stop.id} className="relative group">
              <div className="absolute -left-[39px] top-2 w-6 h-6 rounded-full bg-brand-500 ring-4 ring-slate-950 shadow-lg shadow-brand-500/30"></div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Sticky Final Payment Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Trip Checkout & Hotel Guarantee</span>
          </div>
          <h3 className="font-display font-black text-2xl text-white">Finalize Your Multi-City Experience</h3>
          <p className="text-xs text-slate-300">Complete your $499 payment after configuring food & activities to lock in luxury suites and official boarding passes.</p>
        </div>

        <button
          onClick={handleInitiatePayment}
          className={`w-full sm:w-auto px-8 py-4 text-white font-black text-sm rounded-2xl shadow-2xl flex items-center justify-center space-x-3 transition-transform transform hover:scale-105 ${
            isPaid
              ? 'bg-emerald-600 border border-emerald-400/50 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 shadow-emerald-500/40 ring-4 ring-emerald-500/20'
          }`}
        >
          <CreditCard className="w-5 h-5 animate-pulse" />
          <span>{isPaid ? '✓ Booking Fully Paid & Confirmed' : '💳 Make Final Payment Now ($499)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Payment Success Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:hidden">
          <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-6 text-center bg-slate-950 relative overflow-hidden">
            {paymentStep === 'processing' ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="font-display font-extrabold text-xl text-white">Processing Instant Payment...</h3>
                <p className="text-xs text-slate-400">Verifying payment details & issuing official boarding passes for {trip.name}...</p>
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
                  <h3 className="font-display font-black text-2xl text-white">All Bookings Confirmed!</h3>
                  <p className="text-xs text-slate-400">
                    Your payment of <strong className="text-emerald-400">$499.00 USD</strong> has been successfully processed. All hotel suite vouchers & boarding passes are now active.
                  </p>
                </div>

                {/* Receipt Details */}
                <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Ref:</span>
                    <span className="font-mono font-bold text-white">#TXN-984210</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Trip Package:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">{trip.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Destination:</span>
                    <span className="font-bold text-emerald-400">{mainCityName}, {mainCountry}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setActiveTab('vouchers');
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition-transform transform hover:scale-105"
                >
                  <span>View Boarding Passes & Vouchers</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
