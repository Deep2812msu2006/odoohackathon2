import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tripApi } from '../services/tripApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { formatDateRange } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import { 
  Plus, Search, Calendar, MapPin, Share2, Trash2, Edit3, Eye, Copy,
  TrendingUp, Globe, Clock, DollarSign, BarChart3, PieChart, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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

  // Calculate trip statistics
  const tripStats = useMemo(() => {
    const totalTrips = trips.length;
    const publicTrips = trips.filter(t => t.isPublic).length;
    const privateTrips = totalTrips - publicTrips;
    const totalCities = trips.reduce((acc, trip) => acc + (trip.stops?.length || 0), 0);
    const totalActivities = trips.reduce((acc, trip) => {
      return acc + (trip.stops?.reduce((stopAcc, stop) => stopAcc + (stop.stopActivities?.length || 0), 0) || 0);
    }, 0);
    
    // Calculate trips by month (for line chart)
    const tripsByMonth = trips.reduce((acc, trip) => {
      const month = new Date(trip.startDate).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    
    const monthlyData = Object.entries(tripsByMonth).map(([month, count]) => ({
      month,
      trips: count
    }));

    // Calculate city distribution (for pie chart)
    const cityDistribution = trips.reduce((acc, trip) => {
      trip.stops?.forEach(stop => {
        const cityName = stop.city?.name || 'Unknown';
        acc[cityName] = (acc[cityName] || 0) + 1;
      });
      return acc;
    }, {});
    
    const pieData = Object.entries(cityDistribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return {
      totalTrips,
      publicTrips,
      privateTrips,
      totalCities,
      totalActivities,
      monthlyData,
      pieData
    };
  }, [trips]);

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f97316', '#ec4899', '#8b5cf6'];

  const handleCopyShareLink = (slug) => {
    const url = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public share link copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-display font-bold text-4xl text-white bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent">
            My Planned Trips
          </h1>
          <p className="text-sm text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <span>Manage your multi-city itineraries and shared links</span>
          </p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 transform hover:scale-105 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {/* Statistics Dashboard */}
      {!isLoading && trips.length > 0 && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-3xl p-5 border border-slate-800/50 bg-gradient-to-br from-brand-500/10 to-brand-600/5 hover:from-brand-500/20 hover:to-brand-600/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded-lg">TOTAL</span>
              </div>
              <div className="text-3xl font-black text-white">{tripStats.totalTrips}</div>
              <div className="text-xs text-slate-400 mt-1">Planned Trips</div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-800/50 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 hover:from-emerald-500/20 hover:to-emerald-600/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">CITIES</span>
              </div>
              <div className="text-3xl font-black text-white">{tripStats.totalCities}</div>
              <div className="text-xs text-slate-400 mt-1">Destinations</div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-800/50 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:from-amber-500/20 hover:to-amber-600/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">ACTIVITIES</span>
              </div>
              <div className="text-3xl font-black text-white">{tripStats.totalActivities}</div>
              <div className="text-xs text-slate-400 mt-1">Scheduled</div>
            </div>

            <div className="glass-card rounded-3xl p-5 border border-slate-800/50 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">PUBLIC</span>
              </div>
              <div className="text-3xl font-black text-white">{tripStats.publicTrips}</div>
              <div className="text-xs text-slate-400 mt-1">Shared Trips</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trips Line Chart */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Trip Activity</h3>
                    <p className="text-xs text-slate-400">Monthly trip planning trends</p>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tripStats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="trips" 
                      stroke="url(#gradientLine)" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                    <defs>
                      <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* City Distribution Pie Chart */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">Top Destinations</h3>
                    <p className="text-xs text-slate-400">Most visited cities</p>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={tripStats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tripStats.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        color: '#fff'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips by name or description..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {['all', 'public', 'private'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterPublic(type)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                filterPublic === type
                  ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 scale-105'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-800/50 group hover:border-brand-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 transform hover:-translate-y-2">
              {/* Visual Cover with Enhanced Effects */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Multi-layer gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80"></div>
                
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {/* Status Badge with Pulse Animation */}
                <button
                  onClick={() => publishMutation.mutate({ id: trip.id, isPublic: !trip.isPublic })}
                  className={`absolute top-4 right-4 px-3 py-1.5 backdrop-blur-xl text-[11px] font-bold uppercase rounded-xl tracking-wider border transition-all duration-300 transform hover:scale-105 ${
                    trip.isPublic
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 border-emerald-300 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
                      : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                  title="Click to toggle public visibility"
                >
                  {trip.isPublic ? 'Public Share' : 'Private'}
                </button>

                {/* Trip Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-300 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">
                      {(trip.stops || []).length} {(trip.stops || []).length === 1 ? ' City' : ' Cities'}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-bold text-2xl text-white truncate drop-shadow-lg leading-tight">{trip.name}</h3>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-slate-950/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-slate-700/50">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-medium text-slate-200">{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900/60 to-slate-800/40 backdrop-blur-xl">
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{trip.description || 'No description added.'}</p>
                  
                  {/* Cities Stops Badges with Enhanced Styling */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(trip.stops || []).slice(0, 4).map((stop, idx) => (
                      <span 
                        key={stop.id} 
                        className={`px-3 py-1.5 text-xs font-medium rounded-xl border flex items-center space-x-1.5 transition-all duration-300 transform hover:scale-105 ${
                          idx === 0 
                            ? 'bg-gradient-to-r from-brand-500/20 to-brand-400/10 text-brand-300 border-brand-500/30' 
                            : 'bg-gradient-to-r from-slate-800 to-slate-700/50 text-slate-200 border-slate-700/50 hover:border-brand-500/30'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{stop.city?.name}</span>
                      </span>
                    ))}
                    {(trip.stops || []).length > 4 && (
                      <span className="px-3 py-1.5 bg-slate-800/50 text-slate-400 text-xs font-medium rounded-xl border border-slate-700/50">
                        +{(trip.stops || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Actions Footer */}
                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/trips/${trip.id}/builder`}
                      className="group relative p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-brand-500 hover:to-brand-400 text-brand-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-brand-500/20"
                      title="Edit Itinerary Builder"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <Edit3 className="w-4 h-4 relative z-10" />
                    </Link>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="group relative p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {trip.isPublic && (
                      <button
                        onClick={() => handleCopyShareLink(trip.publicSlug)}
                        className="group relative p-2.5 bg-slate-800/80 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-400 text-emerald-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-emerald-500/20"
                        title="Copy Public Link"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        <Share2 className="w-4 h-4 relative z-10" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTrip(trip);
                      setDeleteModalOpen(true);
                    }}
                    className="group relative p-2.5 text-rose-400 hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-rose-500/20"
                    title="Delete Trip"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <Trash2 className="w-4 h-4 relative z-10" />
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
