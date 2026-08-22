import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi.js';
import { systemApi } from '../services/systemApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Users, Map, Building2, Ticket, Share2, Star, 
  TrendingUp, Database, Activity, Layers, AlertCircle, RefreshCw, Globe, ChevronRight, Settings, DollarSign,
  UserCheck, Search, PieChart, Landmark, ArrowUpRight, BarChart3, Calendar, Eye, X, ExternalLink, Hotel, Utensils, Plane
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid, Legend, ComposedChart
} from 'recharts';

export const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [tripSearchTerm, setTripSearchTerm] = useState('');
  const [selectedTripForModal, setSelectedTripForModal] = useState(null);

  const { data: analyticsData, isLoading, error, refetch: refetchAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data.analytics;
    },
  });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await adminApi.getUsers();
      return res.data.users;
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminApi.updateUserRole(userId, role),
    onSuccess: (res) => {
      toast.success(res.message || 'User role updated successfully!');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminAnalytics']);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update user role.');
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAnalytics(), refetchUsers()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-semibold text-slate-350">Executing financial budget & analytics queries...</p>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="text-center py-16 text-rose-400 space-y-4 glass-card border border-rose-500/20 max-w-lg mx-auto rounded-3xl p-8">
        <AlertCircle className="w-12 h-12 mx-auto text-rose-500" />
        <p className="font-bold text-lg text-white">Failed to Load Analytics</p>
        <p className="text-xs text-slate-400">Please make sure you have Platform Admin privileges.</p>
        <button 
          onClick={handleRefresh} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview, popularCities, popularActivities, financialSummary, tripBudgets, monthlyFinancials, yearlyFinancials } = analyticsData;

  const chartData = [
    { name: 'Users', count: overview.totalUsers, fill: '#3b82f6' },
    { name: 'Trips', count: overview.totalTrips, fill: '#8b5cf6' },
    { name: 'Shares', count: overview.totalShares, fill: '#10b981' },
    { name: 'Cities', count: overview.totalCities, fill: '#f59e0b' },
    { name: 'Activities', count: overview.totalActivities, fill: '#ec4899' },
  ];

  const filteredUsers = (usersData || []).filter(u =>
    u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredTripBudgets = (tripBudgets || []).filter(t =>
    t.name?.toLowerCase().includes(tripSearchTerm.toLowerCase())
  );

  const adminUsersCount = (usersData || []).filter(u => u.role === 'ADMIN').length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card border border-slate-800/80 p-3.5 rounded-2xl text-xs shadow-2xl bg-slate-950/95 backdrop-blur-md min-w-[160px] space-y-1 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: data.fill || '#3b82f6' }}></span>
            <p className="font-black text-slate-200 text-sm tracking-tight">{data.name || data.month || data.year}</p>
          </div>
          <div className="pt-1.5 border-t border-slate-900">
            <p className="text-white font-extrabold text-base">
              {data.totalBudget ? formatCurrency(data.totalBudget) : payload[0].value}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-purple-600 via-brand-500 to-cyan-400 text-white rounded-2xl shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-none">
              Platform Administration Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span>Authorized Admin:</span>
              <span className="font-bold text-purple-400">{currentUser?.name} ({currentUser?.email})</span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-extrabold rounded-md border border-purple-500/30">PLATFORM ADMIN</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-center inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-inner"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Realtime Data</span>
        </button>
      </div>

      {/* Tab Controls (Diagnostics removed, Financial & Profit Analytics added) */}
      <div className="relative flex bg-slate-950/60 p-1 border border-slate-850/30 rounded-2xl inline-flex backdrop-blur-md overflow-x-auto max-w-full scrollbar-none gap-1">
        {[
          { id: 'overview', label: 'System Overview', icon: Layers },
          { id: 'financials', label: 'Trip Budget & Profit Analytics', icon: Landmark },
          { id: 'users', label: 'Users & Admins', icon: Users },
          { id: 'cities', label: 'Destination Insights', icon: Globe },
          { id: 'activities', label: 'Activity Insights', icon: Ticket }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-brand-500 text-white shadow-lg shadow-purple-500/20 font-extrabold scale-102'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', count: overview.totalUsers, desc: 'Registered user accounts', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
              { label: 'Platform Admins', count: adminUsersCount, desc: 'Authorized admin accounts', icon: ShieldCheck, color: 'text-purple-400 bg-purple-500/10' },
              { label: 'Total Trips', count: overview.totalTrips, desc: 'Created multi-stop itineraries', icon: Map, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Platform Net Profit', count: formatCurrency(financialSummary?.totalPlatformProfit || 0), desc: '15% Margin on Booked Trips', icon: Landmark, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Database Cities', count: overview.totalCities, desc: 'Global destinations', icon: Building2, color: 'text-pink-400 bg-pink-500/10' },
              { label: 'Available Activities', count: overview.totalActivities, desc: 'Curated activity catalog', icon: Ticket, color: 'text-indigo-400 bg-indigo-500/10' }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-850 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
                    <p className="font-display text-2xl sm:text-3xl font-black text-white">{stat.count}</p>
                    <p className="text-[10px] text-slate-500">{stat.desc}</p>
                  </div>
                  <div className={`p-3 rounded-xl border border-slate-800 ${stat.color}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-850 lg:col-span-2 space-y-4">
              <h3 className="font-display font-bold text-base text-white">Database Record Volume</h3>
              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }} barSize={28}>
                    <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-4">
              <h3 className="font-display font-bold text-base text-white">Financial & Profit Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View trip-by-trip budget totals, monthly profit margins, and annual revenue growth graphs.
              </p>
              <button
                onClick={() => setActiveTab('financials')}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 text-white font-extrabold text-xs rounded-xl shadow-glow flex items-center justify-center space-x-2"
              >
                <Landmark className="w-4 h-4" />
                <span>Open Budget & Profit Analytics</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Financial & Profit Budget Analytics */}
      {activeTab === 'financials' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Revenue & Profit Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-850">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Booking Volume</p>
              <p className="font-display text-3xl font-black text-white mt-1">{formatCurrency(financialSummary?.totalGrossVolume)}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Total trip budgets calculated</p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-850">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Platform Profit</p>
              <p className="font-display text-3xl font-black text-emerald-400 mt-1">{formatCurrency(financialSummary?.totalPlatformProfit)}</p>
              <p className="text-[10px] text-emerald-500/80 font-bold mt-1">15.0% Platform Fee Margin</p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-850">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Trip Budget</p>
              <p className="font-display text-3xl font-black text-purple-400 mt-1">{formatCurrency(financialSummary?.averageTripBudget)}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Per trip spending average</p>
            </div>

            <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-850">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Profit / Trip</p>
              <p className="font-display text-3xl font-black text-amber-400 mt-1">{formatCurrency(financialSummary?.averageTripProfit)}</p>
              <p className="text-[10px] text-amber-500/80 font-bold mt-1">Net profit per booking</p>
            </div>
          </div>

          {/* Monthly & Yearly Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Budget & Profit Graph (Jan - Dec) */}
            <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">Monthly Budget & Profit Trend (2026)</h3>
                  <p className="text-xs text-slate-400">Monthly booked trip volume vs net platform profit</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-extrabold border border-emerald-500/20">
                  Monthly View
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyFinancials}>
                    <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Bar dataKey="totalBudget" name="Gross Monthly Budget ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="platformProfit" name="Net Profit ($)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Yearly Revenue Growth & Profit Graph (2024 - 2027 Proj.) */}
            <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">Yearly Budget & Profit Trajectory</h3>
                  <p className="text-xs text-slate-400">Multi-year revenue volume comparison graph</p>
                </div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-xl text-[10px] font-extrabold border border-purple-500/20">
                  Yearly View
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearlyFinancials}>
                    <defs>
                      <linearGradient id="colorYearly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Area type="monotone" dataKey="totalBudget" name="Gross Yearly Budget ($)" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="platformProfit" name="Net Platform Profit ($)" stroke="#10b981" fill="url(#colorYearly)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Particular Trip Budget & Profit Breakdown Table */}
          <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-2xl text-white">Particular Trip Budget & Profit Breakdown</h3>
                <p className="text-xs text-slate-400 mt-1">Real calculated costs, activity expenses, and net 15% platform profit per trip</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search trip title..."
                  value={tripSearchTerm}
                  onChange={(e) => setTripSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Trip Title</th>
                    <th className="py-3.5 px-4">Stops</th>
                    <th className="py-3.5 px-4">Activities</th>
                    <th className="py-3.5 px-4">Accom. & Transport</th>
                    <th className="py-3.5 px-4">Total Calculated Budget</th>
                    <th className="py-3.5 px-4 text-right">Platform Net Profit (15%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredTripBudgets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 italic">No trips matched search filter.</td>
                    </tr>
                  ) : (
                    filteredTripBudgets.map((t) => (
                      <tr 
                        key={t.id} 
                        onClick={() => setSelectedTripForModal(t)}
                        className="hover:bg-slate-900/90 transition-all cursor-pointer group border-b border-slate-800/80"
                      >
                        <td className="py-3.5 px-4 font-black text-white group-hover:text-brand-400 flex items-center space-x-2 transition-colors">
                          <span>{t.name}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-brand-400 transition-opacity" />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-300">{t.stopsCount} stops</td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">{formatCurrency(t.activitiesCost)}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-300">{formatCurrency(t.accommodationCost + t.transportCost + t.mealsCost)}</td>
                        <td className="py-3.5 px-4 font-black text-brand-400">{formatCurrency(t.totalBudget)}</td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                          <div className="flex items-center justify-end space-x-2">
                            <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                              +{formatCurrency(t.platformProfit)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTripForModal(t);
                              }}
                              className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Admin Management */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-2xl text-white">Platform Users & Admins</h3>
              <p className="text-xs text-slate-400 mt-1">Manage user roles and assign Platform Admin privileges</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {usersLoading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading platform users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Trips Planned</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const isAdmin = u.role === 'ADMIN';
                    const isSelf = u.id === currentUser?.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={u.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <p className="font-extrabold text-white flex items-center space-x-2">
                                <span>{u.name}</span>
                                {isSelf && <span className="px-2 py-0.5 bg-brand-500/20 text-brand-300 text-[9px] font-bold rounded-md">(You)</span>}
                              </p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {isAdmin ? (
                            <span className="px-3 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-purple-400" /> Platform Admin
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                              Standard User
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{u._count?.trips || 0} trips</td>
                        <td className="py-3.5 px-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="py-3.5 px-4 text-right">
                          {isAdmin ? (
                            <button
                              onClick={() => roleMutation.mutate({ userId: u.id, role: 'USER' })}
                              disabled={roleMutation.isPending || isSelf}
                              title={isSelf ? 'Cannot demote your own active admin session' : 'Demote user to standard role'}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-all disabled:opacity-40"
                            >
                              Remove Admin Role
                            </button>
                          ) : (
                            <button
                              onClick={() => roleMutation.mutate({ userId: u.id, role: 'ADMIN' })}
                              disabled={roleMutation.isPending}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold text-xs rounded-xl shadow-glow transition-all"
                            >
                              Make Platform Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Destination Insights */}
      {activeTab === 'cities' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <h3 className="font-display font-black text-xl text-white">Top Destination Cities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCities.map((city, idx) => (
              <div key={city.id} className="flex p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 rounded-2xl gap-4 transition-all">
                <img src={city.imageUrl} alt={city.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">{city.name}</h4>
                      <p className="text-[10px] text-slate-400">{city.country} • {city.region}</p>
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{city.popularityScore}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Activity Insights */}
      {activeTab === 'activities' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <h3 className="font-display font-black text-xl text-white">Most Added Activities</h3>
          <div className="space-y-3">
            {popularActivities.map((act, idx) => (
              <div key={act.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-850">
                <div className="flex items-center space-x-4">
                  <span className="w-6 text-center font-bold text-xs text-purple-400">#{idx + 1}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{act.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">{act.cityName}</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20">
                  Included in <strong className="text-white font-extrabold">{act.usageCount}</strong> trips
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Trip Master Inspection Modal */}
      {selectedTripForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:hidden">
          <div className="glass-card border border-brand-500/40 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-900/95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase rounded-full border border-emerald-500/30">
                    CONFIRMED TRIP BOOKING
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedTripForModal.id}</span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">{selectedTripForModal.name}</h2>
                <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                  <span>Booked Traveler: <strong className="text-brand-300 font-extrabold">{selectedTripForModal.userName}</strong> ({selectedTripForModal.userEmail})</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedTripForModal(null)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Destinations Route Summary */}
            <div className="glass-card p-4 rounded-2xl border border-slate-800 bg-slate-950/80 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination Route & Stops</p>
              <p className="font-extrabold text-sm text-cyan-300">{selectedTripForModal.stopsSummary || 'All-Inclusive Destination Package'}</p>
            </div>

            {/* Itemized Financial & Budget Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-300 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Financial & Itemized Cost Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Accommodation</span>
                  <span className="font-extrabold text-purple-400 text-base">{formatCurrency(selectedTripForModal.accommodationCost)}</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Dining & Food</span>
                  <span className="font-extrabold text-amber-400 text-base">{formatCurrency(selectedTripForModal.mealsCost)}</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Activity Tickets</span>
                  <span className="font-extrabold text-cyan-400 text-base">{formatCurrency(selectedTripForModal.activitiesCost)}</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Transport Pass</span>
                  <span className="font-extrabold text-blue-400 text-base">{formatCurrency(selectedTripForModal.transportCost)}</span>
                </div>
              </div>
            </div>

            {/* Total Volume & Profit Banner */}
            <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Calculated Trip Budget</p>
                <p className="font-display font-black text-3xl text-cyan-400">{formatCurrency(selectedTripForModal.totalBudget)}</p>
              </div>

              <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-right space-y-0.5">
                <p className="text-[10px] text-emerald-400 font-extrabold uppercase">Platform Net Profit (15%)</p>
                <p className="font-display font-black text-2xl text-emerald-400">+{formatCurrency(selectedTripForModal.platformProfit)}</p>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <Link
                to={`/trips/${selectedTripForModal.id}`}
                target="_blank"
                className="px-5 py-3 bg-gradient-to-r from-brand-600 via-purple-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Full Itinerary Page</span>
              </Link>

              <Link
                to={`/trips/${selectedTripForModal.id}/budget`}
                target="_blank"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-2 transition-all"
              >
                <PieChart className="w-4 h-4" />
                <span>View Budget Dashboard</span>
              </Link>

              <button
                onClick={() => setSelectedTripForModal(null)}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl border border-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
