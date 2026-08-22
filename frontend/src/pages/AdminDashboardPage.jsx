import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi.js';
import { systemApi } from '../services/systemApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Users, Map, Building2, Ticket, Share2, Star, 
  TrendingUp, Database, Activity, Cpu, Layers, AlertCircle, RefreshCw, Globe, ChevronRight, Server, Settings, DollarSign,
  UserCheck, ShieldAlert, CheckCircle2, UserPlus, Search
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';

export const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartType, setChartType] = useState('bar');
  const [userSearchTerm, setUserSearchTerm] = useState('');

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

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => {
      try {
        const res = await systemApi.getHealth();
        return res;
      } catch (err) {
        return { status: 'unhealthy', database: 'Offline' };
      }
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
    await Promise.all([refetchAnalytics(), refetchHealth(), refetchUsers()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading || healthLoading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-semibold text-slate-350">Executing platform analytics queries...</p>
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

  const { overview, popularCities, popularActivities } = analyticsData;
  const dbName = healthData?.status === 'healthy' ? healthData.database : 'Database';
  const dbText = healthData?.status === 'healthy' ? `${healthData.database} Active` : 'Database Offline';

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

  const adminUsersCount = (usersData || []).filter(u => u.role === 'ADMIN').length;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card border border-slate-800/80 p-3.5 rounded-2xl text-xs shadow-2xl bg-slate-950/95 backdrop-blur-md min-w-[160px] space-y-1 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: data.fill }}></span>
            <p className="font-black text-slate-200 text-sm tracking-tight">{data.name}</p>
          </div>
          <div className="pt-1.5 border-t border-slate-900">
            <p className="text-white font-extrabold text-base">{payload[0].value}</p>
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

      {/* Tab Controls */}
      <div className="relative flex bg-slate-950/60 p-1 border border-slate-850/30 rounded-2xl inline-flex backdrop-blur-md overflow-x-auto max-w-full scrollbar-none gap-1">
        {[
          { id: 'overview', label: 'System Overview', icon: Layers },
          { id: 'users', label: 'Users & Admins', icon: Users },
          { id: 'cities', label: 'Destination Insights', icon: Globe },
          { id: 'activities', label: 'Activity Insights', icon: Ticket },
          { id: 'system', label: 'Diagnostics', icon: Cpu }
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
              { label: 'Public Shared / Copies', count: `${overview.publicTrips} / ${overview.totalShares}`, desc: 'Shared trips and copies', icon: Share2, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Database Cities', count: overview.totalCities, desc: 'Global destinations', icon: Building2, color: 'text-pink-400 bg-pink-500/10' },
              { label: 'Connection Engine', count: dbName, desc: dbText, icon: Database, color: 'text-indigo-400 bg-indigo-500/10' }
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
              <h3 className="font-display font-bold text-base text-white">Database Volume Metrics</h3>
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
              <h3 className="font-display font-bold text-base text-white">Platform Governance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only users assigned the <strong>ADMIN</strong> role can access this administration panel. Existing admins can manage role privileges in the <strong>Users & Admins</strong> tab.
              </p>
              <button
                onClick={() => setActiveTab('users')}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-brand-600 text-white font-extrabold text-xs rounded-xl shadow-glow flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Manage Users & Roles</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Admin Management */}
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

      {/* Tab 3: Destination Insights */}
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

      {/* Tab 4: Activity Insights */}
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

      {/* Tab 5: System Diagnostics */}
      {activeTab === 'system' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <h3 className="font-display font-black text-xl text-white">System Diagnostics Panel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Database Engine</p>
              <p className="text-lg font-black text-white mt-1">{dbName}</p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-400 uppercase font-bold">Prisma ORM Version</p>
              <p className="text-lg font-black text-purple-400 mt-1">v5.22.0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
