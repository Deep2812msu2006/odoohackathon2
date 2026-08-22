import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../services/activityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { formatCurrency } from '../utils/formatters.js';
import { 
  Search, Ticket, Clock, MapPin, DollarSign, Filter, Star, Sparkles, 
  Heart, Compass, CheckCircle2, X, Calendar, Flame, ChevronRight, Eye 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ActivitySearchPage = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, budget, mid, luxury
  const [sortBy, setSortBy] = useState('popularity'); // popularity, priceAsc, priceDesc, duration
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  
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

  // Client-side Price Filtering and Sorting for dynamic response
  const filteredActivities = rawActivities.filter(act => {
    if (priceFilter === 'all') return true;
    if (priceFilter === 'free') return act.estimatedCost === 0;
    if (priceFilter === 'budget') return act.estimatedCost > 0 && act.estimatedCost <= 30;
    if (priceFilter === 'mid') return act.estimatedCost > 30 && act.estimatedCost <= 80;
    if (priceFilter === 'luxury') return act.estimatedCost > 80;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'popularity') {
      // Deterministic popularity score based on name length
      const scoreA = (a.name.length * 7) % 10 + 40; 
      const scoreB = (b.name.length * 7) % 10 + 40;
      return scoreB - scoreA;
    }
    if (sortBy === 'priceAsc') return a.estimatedCost - b.estimatedCost;
    if (sortBy === 'priceDesc') return b.estimatedCost - a.estimatedCost;
    if (sortBy === 'duration') return b.durationHours - a.durationHours;
    return 0;
  });

  // Deterministic Star Rating generator
  const getRating = (id) => {
    const seed = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    const score = 4.0 + (seed % 10) * 0.1;
    return score.toFixed(1);
  };

  // Deterministic Reviews count generator
  const getReviewCount = (id) => {
    const seed = id.charCodeAt(1) + id.charCodeAt(id.length - 2);
    return 12 + (seed % 150);
  };

  // Deterministic Difficulty badge based on category
  const getDifficulty = (category) => {
    if (['adventure'].includes(category)) return { label: 'Intense', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (['sightseeing', 'shopping'].includes(category)) return { label: 'Mild', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    if (['food', 'relaxation', 'other'].includes(category)) return { label: 'Relaxed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    return { label: 'Moderate', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
  };

  // Deterministic Reviews contents
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
      setWishlist(wishlist.filter(item => item.id !== act.id));
      toast.success('Removed from your saved activities');
    } else {
      setWishlist([...wishlist, act]);
      toast({
        icon: '💖',
        duration: 3000,
        style: {
          background: '#064e3b',
          color: '#ecfdf5',
        },
        message: 'Saved to your wishlist!'
      });
      toast.success(`Saved "${act.name}" to wishlist!`);
    }
  };

  const handleBookActivity = (e) => {
    e.preventDefault();
    if (!bookingDate) {
      toast.error('Please select a travel date.');
      return;
    }
    setIsSubmittingBooking(true);
    setTimeout(() => {
      setIsSubmittingBooking(false);
      setSelectedActivity(null);
      toast.success(`Successfully planned "${selectedActivity.name}" for your trip! 🎉`);
      setBookingDate('');
    }, 1500);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-in relative pb-16">
      
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
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold">
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
            <div className="flex items-center space-x-2 bg-slate-950/60 rounded-xl px-4 py-2.5 border border-slate-800/50 backdrop-blur-md">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="text-slate-300">Saved Wishlist: </span>
              <span className="text-white font-bold text-sm">{wishlist.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Filter System */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800/50 bg-gradient-to-b from-slate-900/50 to-slate-800/20 backdrop-blur-xl space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Search Bar */}
          <div className="relative lg:col-span-4 w-full">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, tags, or description..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all placeholder:text-slate-500 border border-slate-800/50"
            />
          </div>

          {/* Quick Price Segment Filter */}
          <div className="lg:col-span-5 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Price:
            </span>
            {[
              { id: 'all', label: 'All Costs' },
              { id: 'free', label: 'Free Only' },
              { id: 'budget', label: '< $30' },
              { id: 'mid', label: '$30 - $80' },
              { id: 'luxury', label: '$80+' }
            ].map(segment => (
              <button
                key={segment.id}
                onClick={() => setPriceFilter(segment.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  priceFilter === segment.id
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-500/20 scale-105'
                    : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {segment.label}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="lg:col-span-3 w-full flex items-center justify-end space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full max-w-[200px] bg-slate-950/60 border border-slate-800/50 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            >
              <option value="popularity">🔥 High Popularity</option>
              <option value="priceAsc">💵 Cost: Low to High</option>
              <option value="priceDesc">💰 Cost: High to Low</option>
              <option value="duration">⏱️ Duration Hours</option>
            </select>
          </div>
        </div>

        {/* Category Carousel Row */}
        <div className="border-t border-slate-800/50 pt-5 space-y-3">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Select Category</p>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                categoryFilter === ''
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-300 shrink-0 border border-slate-800/20 ${
                  categoryFilter === cat.name
                    ? `bg-gradient-to-r ${cat.gradient.split(' ')[0]} ${cat.gradient.split(' ')[1]} text-white shadow-lg scale-105`
                    : 'bg-slate-950/40 text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Grid Content */}
      {isLoading ? (
        <GridSkeleton count={6} />
      ) : filteredActivities.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800/50 max-w-xl mx-auto space-y-4">
          <Compass className="w-12 h-12 text-slate-500 mx-auto animate-spin" />
          <h3 className="font-display font-bold text-lg text-white">No Matching Activities</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Try adjusting your search query, selecting different categories, or raising your budget criteria.
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
                className="glass-card rounded-3xl overflow-hidden border border-slate-800/50 flex flex-col justify-between group hover:border-brand-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 transform hover:-translate-y-1.5"
              >
                {/* Visual Cover */}
                <div className="h-60 relative overflow-hidden">
                  <img
                    src={act.imageUrl || 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&auto=format&fit=crop&q=80'}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Category Pill Tag */}
                  <span className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase font-bold rounded-xl border border-white/10 backdrop-blur-xl bg-gradient-to-r ${catGradient}`}>
                    {act.category}
                  </span>
                  
                  {/* Heart / Wishlist Trigger */}
                  <button
                    onClick={() => toggleWishlist(act)}
                    className="absolute top-4 right-4 p-2 bg-slate-950/60 hover:bg-slate-950/90 text-white rounded-xl backdrop-blur-sm border border-slate-800/50 transition duration-300"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
                  </button>
                  
                  {/* Star Rating Overlay */}
                  <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 bg-slate-950/60 backdrop-blur-md rounded-lg px-2.5 py-1 border border-slate-850">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-bold text-white">{rating}</span>
                    <span className="text-[9px] text-slate-400">({reviews} reviews)</span>
                  </div>

                  {/* Difficulty Tag */}
                  <div className={`absolute bottom-4 right-4 px-2.5 py-1 text-[10px] font-bold rounded-lg border ${diff.color} backdrop-blur-md`}>
                    {diff.label}
                  </div>
                </div>

                {/* Info Content Section */}
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

                  {/* Footer Elements */}
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
                      
                      {/* Action Button: Open Preview Modal */}
                      <button
                        onClick={() => {
                          setSelectedActivity(act);
                          // Reset scheduling dates
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

      {/* 4. Rich Detail Preview Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden max-w-2xl w-full bg-slate-900 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedActivity(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-950 border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cover Photo */}
            <div className="h-64 relative">
              <img
                src={selectedActivity.imageUrl || 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&auto=format&fit=crop&q=80'}
                alt={selectedActivity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
              
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 bg-brand-500/20 text-brand-300 text-[10px] uppercase font-bold rounded-lg border border-brand-500/30 backdrop-blur-md">
                  {selectedActivity.category}
                </span>
                <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white mt-2 drop-shadow-md">
                  {selectedActivity.name}
                </h2>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Quick Details Row */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2 bg-slate-950/40 rounded-xl px-3.5 py-2 border border-slate-800/50">
                  <MapPin className="w-4 h-4 text-brand-400" />
                  <span>{selectedActivity.city?.name}, {selectedActivity.city?.country}</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/40 rounded-xl px-3.5 py-2 border border-slate-800/50">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>{selectedActivity.durationHours} Hours Duration</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/40 rounded-xl px-3.5 py-2 border border-slate-800/50">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">
                    {selectedActivity.estimatedCost === 0 ? 'Free Experience' : `${formatCurrency(selectedActivity.estimatedCost)} per slot`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About this experience</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedActivity.description || 'Embark on a customized local tour highlighting the best cultural events, sightseeing spots, and hidden local attractions of the region.'}
                </p>
              </div>

              {/* Reviews Mock Block */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Guest Reviews</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getReviews(selectedActivity.id).map((rev, i) => (
                    <div key={i} className="bg-slate-950/30 rounded-xl p-3 border border-slate-850 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-white font-bold">{rev.author}</span>
                        <span className="text-amber-400 font-semibold">★ {rev.rating}.0</span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-3">"{rev.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Booking Scheduler */}
              <form onSubmit={handleBookActivity} className="border-t border-slate-800 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>Add to Itinerary Scheduler</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Target Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Preferred Time Slot</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(null)}
                    className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800/80 text-xs font-bold text-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-650 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isSubmittingBooking ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scheduling...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Schedule into Stop</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
