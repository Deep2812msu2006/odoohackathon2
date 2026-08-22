import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { activityApi } from '../services/activityApi.js';
import { tripApi } from '../services/tripApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { formatCurrency } from '../utils/formatters.js';
import { 
  Search, Ticket, Clock, MapPin, DollarSign, Filter, Star, Sparkles, 
  Heart, Compass, CheckCircle2, X, Calendar, Flame, ChevronRight, ChevronLeft, Eye,
  Play, Pause, Image as ImageIcon, Volume2, VolumeX, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const FALLBACK_ACTIVITY_IMAGE = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80';

// Category-Based Activity Photo Galleries (4 photos per category)
const ACTIVITY_CATEGORY_PHOTOS = {
  sightseeing: [
    { title: 'Iconic Landmark Vista', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Historic Monument Tour', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Panoramic Viewpoint', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Dubrovnik Adriatic Coastal View', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&auto=format&fit=crop&q=80' },
  ],
  food: [
    { title: 'Street Food Market Feast', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Chef\'s Tasting Experience', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Local Cuisine Platter', url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Artisan Bakery Selection', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80' },
  ],
  adventure: [
    { title: 'Mountain Summit Trail', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Kayaking Crystal Waters', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Aerial Adventure View', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Wilderness Exploration', url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&auto=format&fit=crop&q=80' },
  ],
  culture: [
    { title: 'Ancient Temple Interior', url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Art Museum Gallery Hall', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Heritage Architecture Walk', url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Cultural Festival Ceremony', url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&auto=format&fit=crop&q=80' },
  ],
  nightlife: [
    { title: 'Neon City Lights District', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Rooftop Bar Skyline View', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Live Music Performance', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Evening Cruise Atmosphere', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop&q=80' },
  ],
  relaxation: [
    { title: 'Coastal Beach Serenity', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Garden Zen Pathway', url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Thermal Spa Retreat', url: 'https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Sunset Horizon View', url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&auto=format&fit=crop&q=80' },
  ],
  shopping: [
    { title: 'Grand Bazaar Market Lane', url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Artisan Craft Workshop', url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Designer Boutique Street', url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Local Souvenir Selection', url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&auto=format&fit=crop&q=80' },
  ],
  other: [
    { title: 'Unique Local Experience', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Hidden Gem Discovery', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Off-the-Beaten-Path Tour', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Memorable Photo Moment', url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&auto=format&fit=crop&q=80' },
  ],
};

// Helper: get slideshow photos for an activity (uses its own image + category photos)
const getActivitySlides = (activity) => {
  const catPhotos = ACTIVITY_CATEGORY_PHOTOS[activity.category] || ACTIVITY_CATEGORY_PHOTOS['other'];
  const mainUrl = activity.imageUrl || catPhotos[0].url;
  const slides = [{ title: activity.name, url: mainUrl }];
  for (const p of catPhotos) {
    if (p.url !== mainUrl && slides.length < 4) {
      slides.push(p);
    }
  }
  return slides;
};

// Interactive Multi-Photo Image Slider Component for Each Activity Card
const ActivityCardImageSlider = ({ activity, onOpenDetail }) => {
  const slides = getActivitySlides(activity);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let timer;
    if (isHovered && slides.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div 
      className="absolute inset-0 overflow-hidden cursor-pointer group/slider select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetail(activity)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ width: `${slides.length * 100}%`, transform: `translateX(-${currentIndex * (100 / slides.length)}%)` }}
      >
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.url}
            alt={slide.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = FALLBACK_ACTIVITY_IMAGE;
            }}
            className="h-full object-cover flex-shrink-0"
            style={{ width: `${100 / slides.length}%` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity duration-500"></div>

      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/70 hover:bg-slate-900 text-white rounded-xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-950/70 hover:bg-slate-900 text-white rounded-xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-5 bg-brand-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Modal Photo Slideshow Component for Activity Detail Modal
const ModalActivitySlider = ({ slides, activity }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const currentSlide = slides[currentIndex % slides.length];

  return (
    <div className="h-72 relative overflow-hidden group">
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentSlide.url})` }}
      />
      <img
        key={currentSlide.url}
        src={currentSlide.url}
        alt={currentSlide.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = FALLBACK_ACTIVITY_IMAGE;
        }}
        className="w-full h-full object-cover animate-fade-in relative z-10"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent z-10"></div>

      <div className="absolute bottom-12 left-6 right-6 z-20">
        <span className="px-2.5 py-1 bg-brand-500/20 text-brand-300 text-[10px] uppercase font-bold rounded-lg border border-brand-500/30 backdrop-blur-md">
          {activity.category}
        </span>
        <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-2 drop-shadow-md">
          {activity.name}
        </h2>
        <p className="text-[10px] uppercase font-bold text-pink-400 tracking-wider mt-1">
          Image {currentIndex + 1} of {slides.length}
        </p>
      </div>

      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="absolute top-4 right-14 p-2 bg-slate-950/70 hover:bg-slate-900 text-white rounded-xl border border-slate-800 backdrop-blur-md transition-all z-20"
      >
        {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
      </button>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 hover:bg-slate-900 text-white rounded-xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/60 hover:bg-slate-900 text-white rounded-xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-pink-500' : 'w-1.5 bg-slate-600 hover:bg-slate-400'}`}
          />
        ))}
      </div>
    </div>
  );
};

export const ActivitySearchPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all'); // all, wishlist, free, budget, mid, luxury
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  // Persisted Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('globetrotter_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('globetrotter_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Modal Booking Mock State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const categories = [
    { name: 'sightseeing', label: 'Sightseeing', gradient: 'from-cyan-500 to-blue-500 text-cyan-200' },
    { name: 'food', label: 'Food & Dining', gradient: 'from-amber-500 to-orange-500 text-amber-100' },
    { name: 'adventure', label: 'Adventure', gradient: 'from-rose-500 to-red-600 text-rose-100' },
    { name: 'culture', label: 'Art & Culture', gradient: 'from-purple-500 to-indigo-600 text-purple-100' },
    { name: 'nightlife', label: 'Nightlife', gradient: 'from-fuchsia-600 to-pink-500 text-fuchsia-100' },
    { name: 'relaxation', label: 'Relaxation', gradient: 'from-teal-500 to-emerald-500 text-teal-100' },
    { name: 'shopping', label: 'Shopping', gradient: 'from-violet-500 to-pink-500 text-violet-100' },
    { name: 'other', label: 'Other', gradient: 'from-slate-500 to-slate-600 text-slate-200' }
  ];

  const { data: rawActivities = [], isLoading } = useQuery({
    queryKey: ['activities', search, categoryFilter],
    queryFn: async () => {
      const res = await activityApi.getActivities({
        search,
        category: categoryFilter,
      });
      return res.data.activities;
    },
  });

  // Client-side Price & Wishlist Filtering and Sorting
  const filteredActivities = rawActivities.filter(act => {
    if (priceFilter === 'wishlist') {
      return wishlist.some(w => w.id === act.id);
    }
    if (priceFilter === 'all') return true;
    if (priceFilter === 'free') return act.estimatedCost === 0;
    if (priceFilter === 'budget') return act.estimatedCost > 0 && act.estimatedCost <= 30;
    if (priceFilter === 'mid') return act.estimatedCost > 30 && act.estimatedCost <= 80;
    if (priceFilter === 'luxury') return act.estimatedCost > 80;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popularity') {
      const scoreA = (a.name.length * 7) % 10 + 40; 
      const scoreB = (b.name.length * 7) % 10 + 40;
      return scoreB - scoreA;
    }
    if (sortBy === 'priceAsc') return a.estimatedCost - b.estimatedCost;
    if (sortBy === 'priceDesc') return b.estimatedCost - a.estimatedCost;
    if (sortBy === 'duration') return b.durationHours - a.durationHours;
    return 0;
  });

  const getRating = (id) => {
    const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    const score = 4.0 + (seed % 10) * 0.1;
    return score.toFixed(1);
  };

  const getReviewCount = (id) => {
    const seed = id.charCodeAt(1) + id.charCodeAt(id.length - 2);
    return 12 + (seed % 150);
  };

  const getDifficulty = (category) => {
    if (['adventure'].includes(category)) return { label: 'Intense', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (['sightseeing', 'shopping'].includes(category)) return { label: 'Mild', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    if (['food', 'relaxation', 'other'].includes(category)) return { label: 'Relaxed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    return { label: 'Moderate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  };

  const getReviews = (id) => {
    const seed = id.charCodeAt(0) % 3;
    const items = [
      [
        { author: 'Jane Doe', rating: 5, text: 'Absolutely spectacular! Highly recommended for anyone visiting.' },
        { author: 'Marc L.', rating: 4, text: 'Very educational guide, beautiful sights. Worth the money.' },
        { author: 'Yuki T.', rating: 5, text: 'One of the best travel experiences of my life!' }
      ],
      [
        { author: 'Sarah K.', rating: 5, text: 'Unforgettable experience. Easy to book and check in.' },
        { author: 'John M.', rating: 4, text: 'Guides were very friendly and welcoming. Had a great afternoon.' },
        { author: 'Alex H.', rating: 5, text: 'Everything was perfectly timed. Highly professional!' }
      ],
      [
        { author: 'Carlos R.', rating: 5, text: 'Delicious, insightful, and incredibly fun. A absolute must!' },
        { author: 'Emma P.', rating: 5, text: 'Worth every single penny. Made our trip so special!' },
        { author: 'David S.', rating: 4, text: 'Wonderful pacing. Not rushed at all, perfect sightseeing.' }
      ]
    ];
    return items[seed];
  };

  const toggleWishlist = (act) => {
    if (wishlist.some(item => item.id === act.id)) {
      setWishlist(prev => prev.filter(item => item.id !== act.id));
      toast.success(`Removed "${act.name}" from your saved wishlist.`, {
        icon: '💔',
      });
    } else {
      setWishlist(prev => [...prev, act]);
      toast.success(`Saved "${act.name}" to your wishlist!`, {
        icon: '💖',
        style: {
          background: '#0f172a',
          color: '#f8fafc',
          border: '1px solid rgba(244, 63, 94, 0.4)',
        },
      });
    }
  };

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripIdParam = searchParams.get('tripId');
  const categoryParam = searchParams.get('category');
  const dateParam = searchParams.get('date');
  const timeParam = searchParams.get('time');
  const placeParam = searchParams.get('place');

  useEffect(() => {
    if (categoryParam) setCategoryFilter(categoryParam);
    if (placeParam) setSearch(placeParam);
    if (dateParam) setBookingDate(dateParam);
    if (timeParam) setBookingTime(timeParam);
  }, [categoryParam, placeParam, dateParam, timeParam]);

  // When opening modal for selected activity, auto-fill date & time from params
  useEffect(() => {
    if (selectedActivity) {
      if (dateParam) setBookingDate(dateParam);
      if (timeParam) setBookingTime(timeParam);
    }
  }, [selectedActivity, dateParam, timeParam]);

  const handleBookActivity = async (e) => {
    e.preventDefault();
    const dateToUse = bookingDate || dateParam || new Date().toISOString().split('T')[0];
    const timeToUse = bookingTime || timeParam || '10:00';
    setIsSubmittingBooking(true);

    try {
      if (tripIdParam) {
        // Fetch trip details to find target stop matching the activity's cityId
        const tripRes = await tripApi.getTripById(tripIdParam);
        const tripData = tripRes.data.trip;

        const actCityId = selectedActivity.cityId || selectedActivity.city?.id;
        const actCityName = (selectedActivity.city?.name || '').toLowerCase();

        // 1. Look for existing stop matching the activity's cityId or city name
        let targetStop = tripData?.stops?.find(s => 
          s.cityId === actCityId || 
          (s.city?.name && s.city.name.toLowerCase() === actCityName)
        );

        let targetStopId = targetStop?.id;

        // 2. If no stop for this city exists on the trip yet, automatically create a new stop for this city!
        if (!targetStopId) {
          const stopRes = await tripApi.addStop(tripIdParam, {
            cityId: actCityId,
            arrivalDate: dateToUse,
            departureDate: dateToUse,
            notes: `Auto-added destination stop for ${selectedActivity.name}`,
          });
          targetStopId = stopRes.data.stop.id;
        } else {
          // 3. Verify if dateToUse falls between targetStop's arrivalDate and departureDate
          const arrStr = targetStop.arrivalDate ? new Date(targetStop.arrivalDate).toISOString().split('T')[0] : dateToUse;
          const depStr = targetStop.departureDate ? new Date(targetStop.departureDate).toISOString().split('T')[0] : dateToUse;

          // If scheduled date is outside existing stop dates, expand stop date range automatically
          if (dateToUse < arrStr || dateToUse > depStr) {
            await tripApi.updateStop(tripIdParam, targetStopId, {
              arrivalDate: dateToUse < arrStr ? dateToUse : arrStr,
              departureDate: dateToUse > depStr ? dateToUse : depStr,
            });
          }
        }

        // 4. Add activity to matching city stop
        await tripApi.addActivityToStop(tripIdParam, targetStopId, {
          activityId: selectedActivity.id,
          scheduledDate: dateToUse,
          scheduledTime: timeToUse,
          customCost: selectedActivity.estimatedCost || 45,
        });

        toast.success(`Added "${selectedActivity.name}" to trip schedule & budget! Redirecting... 🎉`, { icon: '✨' });
        setTimeout(() => {
          setIsSubmittingBooking(false);
          setSelectedActivity(null);
          navigate(`/trips/${tripIdParam}`);
        }, 1200);
        return;
      }

      setTimeout(() => {
        setIsSubmittingBooking(false);
        setSelectedActivity(null);
        toast.success(`Successfully planned "${selectedActivity.name}" for your trip! 🎉`);
        setBookingDate('');
      }, 1200);
    } catch (err) {
      setIsSubmittingBooking(false);
      toast.error(err.message || 'Failed to add activity to trip.');
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-in relative pb-16">
      {/* Active Trip Context Banner with Pre-filled Info Callout */}
      {tripIdParam && (
        <div className="p-5 bg-gradient-to-r from-brand-950/80 via-slate-950 to-cyan-950/40 border border-brand-500/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-brand-300 shadow-2xl">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse shrink-0" />
            <div className="space-y-0.5">
              <p className="font-extrabold text-white text-sm">Auto-Filing Experience Details for Trip Schedule</p>
              <p className="text-xs text-slate-300">
                Target Date: <strong className="text-amber-400">{dateParam || 'Trip Date'}</strong> • Time Slot: <strong className="text-emerald-400">{timeParam || '10:00 AM'}</strong> • Location: <strong className="text-cyan-400">{placeParam || 'Destination'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/trips/${tripIdParam}`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 shrink-0 flex items-center space-x-1.5 shadow-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Trip Page</span>
          </button>
        </div>
      )}

      {/* 2ND PAGE STANDALONE SHOWCASE VIEW WHEN AN ACTIVITY IS CLICKED */}
      {selectedActivity ? (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
          {/* Top Header Controls Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setSelectedActivity(null)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-800 flex items-center space-x-2 shadow-lg transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 text-brand-400" />
              <span>Back to All Browse Activities</span>
            </button>

            <button
              onClick={() => toggleWishlist(selectedActivity)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 transition-all ${
                wishlist.some(w => w.id === selectedActivity.id)
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlist.some(w => w.id === selectedActivity.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{wishlist.some(w => w.id === selectedActivity.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
            </button>
          </div>

          {/* Hero Multi-Photo Showcase Slider */}
          <div className="glass-card rounded-3xl overflow-hidden border border-brand-500/30 shadow-2xl bg-slate-900">
            {(() => {
              const slides = getActivitySlides(selectedActivity);
              return <ModalActivitySlider slides={slides} activity={selectedActivity} />;
            })()}

            <div className="p-8 space-y-8">
              {/* Quick Info Badges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination City</span>
                  <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <span>{selectedActivity.city?.name}, {selectedActivity.city?.country}</span>
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                  <span className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>{selectedActivity.durationHours} Hours Duration</span>
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ticket Price</span>
                  <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>{selectedActivity.estimatedCost === 0 ? 'Free Experience' : `${formatCurrency(selectedActivity.estimatedCost)} per slot`}</span>
                  </span>
                </div>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Guest Rating</span>
                  <span className="font-extrabold text-amber-400 text-sm flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{getRating(selectedActivity.id)} ★ ({getReviewCount(selectedActivity.id)} reviews)</span>
                  </span>
                </div>
              </div>

              {/* Experience Description & Inclusions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-display font-black text-xl text-white">About This Experience</h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {selectedActivity.description || 'Embark on a customized local tour highlighting the best cultural events, sightseeing spots, and hidden local attractions of the region.'}
                    </p>
                  </div>

                  {/* Included Highlights */}
                  <div className="space-y-3 p-5 bg-slate-950/60 rounded-2xl border border-slate-800">
                    <h4 className="text-xs font-black uppercase text-brand-300 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>What's Included in This Experience Pass</span>
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 font-medium">
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Priority FastTrack Entrance Pass</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Certified Local Guide / Culinary Host</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>All Food Market Samples & Tastings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>Full Digital Voucher & Barcode Confirmation</span>
                      </li>
                    </ul>
                  </div>

                  {/* Guest Reviews Section */}
                  <div className="space-y-4">
                    <h3 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span>Guest Reviews ({getReviewCount(selectedActivity.id)})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {getReviews(selectedActivity.id).map((rev, i) => (
                        <div key={i} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-white font-extrabold">{rev.author}</span>
                            <span className="text-amber-400 font-bold">★ {rev.rating}.0</span>
                          </div>
                          <p className="text-xs text-slate-300 italic leading-relaxed">"{rev.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking & Trip Scheduler Sidebar Form */}
                <div className="space-y-4">
                  <div className="glass-card p-6 rounded-3xl border border-brand-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950/30 space-y-5 shadow-2xl">
                    <div className="space-y-1 border-b border-slate-800 pb-3">
                      <h4 className="font-display font-black text-lg text-white flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-brand-400" />
                        <span>Add to Trip Itinerary</span>
                      </h4>
                      <p className="text-xs text-slate-400">Schedule this experience into your trip plan & calculate total budget</p>
                    </div>

                    <form onSubmit={handleBookActivity} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-slate-300">Target Date</label>
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs uppercase font-extrabold text-slate-300">Preferred Time Slot</label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                        >
                          <option value="08:30">08:30 AM (Morning Tour)</option>
                          <option value="10:00">10:00 AM (Mid-Morning)</option>
                          <option value="12:30">12:30 PM (Lunch & Food Market)</option>
                          <option value="14:30">14:30 PM (Afternoon Visit)</option>
                          <option value="19:30">19:30 PM (Gourmet Evening Dinner)</option>
                        </select>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingBooking}
                          className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-black rounded-xl shadow-xl shadow-brand-500/30 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
                        >
                          {isSubmittingBooking ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Adding to Trip Schedule...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4.5 h-4.5" />
                              <span>Schedule & Save into Trip</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GRID VIEW WITH ALL ACTIVITY CARDS WHEN NO ACTIVITY IS SELECTED */
        <>
          {/* 1. Header Showcase Banner */}
          <div className="relative rounded-3xl overflow-hidden glass-card border border-slate-800/80 p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-900/90 to-brand-950/20 shadow-2xl">
            <div className="absolute right-0 top-0 w-[40%] h-full bg-gradient-to-l from-brand-500/10 to-transparent blur-3xl pointer-events-none"></div>
            <div className="absolute left-10 bottom-0 w-[30%] h-[30%] bg-blue-500/5 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center space-x-2 bg-brand-500/10 text-brand-300 text-[11px] font-bold uppercase tracking-wider rounded-xl px-3 py-1.5 w-fit border border-brand-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Discover Local Wonders</span>
              </div>
              <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
                Curated Experiences <br/>
                <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Designed for Adventure
                </span>
              </h1>
              <p className="text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed">
                Skip the generic itineraries. Dive into personalized street food trails, historic guided tours, high-adrenaline sports, and tranquil cultural retreats tailored by local curators.
              </p>
              
              {/* Quick Stats Grid */}
              <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-semibold">
                <div className="flex items-center space-x-2 bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800/50 backdrop-blur-md">
                  <Compass className="w-4 h-4 text-brand-400" />
                  <span className="text-slate-300">Total Tours: </span>
                  <span className="text-white font-bold text-sm">{rawActivities.length}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800/50 backdrop-blur-md">
                  <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-slate-300">High Energy: </span>
                  <span className="text-white font-bold text-sm">
                    {rawActivities.filter(a => ['adventure'].includes(a.category)).length}
                  </span>
                </div>

                {/* Clickable Wishlist Counter Button */}
                <button
                  onClick={() => setPriceFilter('wishlist')}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 border backdrop-blur-md transition-all transform hover:scale-105 ${
                    priceFilter === 'wishlist'
                      ? 'bg-rose-500/25 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-500/20'
                      : 'bg-slate-950/60 border-slate-800/50 text-slate-300 hover:border-rose-500/30'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
                  <span>Saved Wishlist ({wishlist.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Interactive Search & Filter Control Bar */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-6 shadow-xl bg-slate-900/90">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search experiences, tours, food or cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-xs font-medium text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500/50 transition"
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Price & Wishlist Filter Pills */}
              <div className="md:col-span-4 flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
                <span className="text-xs text-slate-400 font-bold flex items-center space-x-1 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-brand-400" />
                  <span>Filter:</span>
                </span>
                
                {[
                  { id: 'all', label: 'All Costs' },
                  { id: 'wishlist', label: `💖 Saved Wishlist (${wishlist.length})` },
                  { id: 'free', label: 'Free Only' },
                  { id: 'budget', label: '< $30' },
                  { id: 'mid', label: '$30 - $80' },
                  { id: 'luxury', label: '$80+' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPriceFilter(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      priceFilter === item.id
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="md:col-span-3 flex items-center justify-end space-x-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="popularity">🔥 High Popularity</option>
                  <option value="priceAsc">💲 Price: Low to High</option>
                  <option value="priceDesc">💎 Price: High to Low</option>
                  <option value="duration">⏱️ Longest Duration</option>
                </select>
              </div>
            </div>

            {/* Category Pills Bar */}
            <div className="pt-2 border-t border-slate-850">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5">Select Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter('')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === ''
                      ? 'bg-slate-200 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  ALL CATEGORIES
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setCategoryFilter(categoryFilter === cat.name ? '' : cat.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      categoryFilter === cat.name
                        ? `bg-gradient-to-r ${cat.gradient} border-white/20 shadow-lg font-black scale-105`
                        : 'bg-slate-950/60 text-slate-300 hover:text-white border-slate-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Activity Cards Grid */}
          {isLoading ? (
            <GridSkeleton count={6} />
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 text-slate-400 glass-card rounded-3xl border border-slate-800/80 space-y-4 max-w-xl mx-auto">
              <Heart className="w-12 h-12 text-rose-500/40 mx-auto animate-pulse" />
              <h3 className="font-display font-bold text-lg text-white">
                {priceFilter === 'wishlist' ? 'No Saved Wishlist Items Yet' : 'No Matching Activities'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {priceFilter === 'wishlist'
                  ? 'Click the heart icon on any activity card to save it to your wishlist here!'
                  : 'Try adjusting your search query, selecting different categories, or raising your budget criteria.'}
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setPriceFilter('all');
                }}
                className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-xs rounded-xl hover:bg-brand-500 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredActivities.map((act) => {
                const rating = getRating(act.id);
                const reviews = getReviewCount(act.id);
                const diff = getDifficulty(act.category);
                const catGradient = categories.find(c => c.name === act.category)?.gradient || 'from-slate-500 to-slate-600';
                const isWishlisted = wishlist.some(w => w.id === act.id);

                return (
                  <div 
                    key={act.id}
                    onClick={() => {
                      setSelectedActivity(act);
                      setBookingDate('');
                    }}
                    className="glass-card rounded-3xl overflow-hidden border border-slate-800/50 flex flex-col justify-between group hover:border-brand-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 transform hover:-translate-y-1.5 cursor-pointer"
                  >
                    <div className="h-60 relative overflow-hidden">
                      <ActivityCardImageSlider activity={act} onOpenDetail={(a) => { setSelectedActivity(a); setBookingDate(''); }} />
                      
                      <span className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase font-bold rounded-xl border border-white/10 backdrop-blur-xl bg-gradient-to-r ${catGradient} z-20 pointer-events-none`}>
                        {act.category}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(act);
                        }}
                        title={isWishlisted ? "Remove from Saved Wishlist" : "Save to Wishlist"}
                        className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md border transition-all duration-300 z-20 transform hover:scale-110 active:scale-95 ${
                          isWishlisted
                            ? 'bg-rose-500/30 border-rose-500/60 text-rose-400 shadow-lg shadow-rose-500/30'
                            : 'bg-slate-950/70 border-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <Heart className={`w-4.5 h-4.5 transition-transform duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110 animate-pulse' : 'text-slate-300'}`} />
                      </button>
                      
                      <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 bg-slate-950/60 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-850 z-20 pointer-events-none">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-white">{rating}</span>
                        <span className="text-[9px] text-slate-400">({reviews} reviews)</span>
                      </div>

                      <div className={`absolute bottom-4 right-4 px-2.5 py-1 text-[10px] font-bold rounded-lg border ${diff.color} backdrop-blur-md z-20 pointer-events-none`}>
                        {diff.label}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950/40 space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                          {act.name}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-400" />
                          <span className="font-medium truncate">{act.city?.name}, {act.city?.country}</span>
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                          {act.description || 'No description available for this curated local experience.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800/50">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1 text-slate-400 bg-slate-900/60 rounded-lg px-2.5 py-1.5 border border-slate-800">
                            <Clock className="w-3.5 h-3.5 text-brand-400" />
                            <span className="font-medium text-slate-300">{act.durationHours} hrs</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-emerald-400">
                            {act.estimatedCost === 0 ? 'Free' : formatCurrency(act.estimatedCost)}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedActivity(act);
                              setBookingDate('');
                            }}
                            className="p-2 bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white rounded-xl border border-brand-500/20 transition-all duration-300 transform group-hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
