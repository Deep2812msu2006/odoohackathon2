import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi.js';
import { systemApi } from '../services/systemApi.js';
import { 
  ShieldCheck, Users, Map, Building2, Ticket, Share2, Star, 
  TrendingUp, Database, Activity, Cpu, Layers, AlertCircle, RefreshCw, Globe, ChevronRight, Server, Settings, DollarSign,
  Terminal, Play, Pause, Trash2, Eye
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, CartesianGrid
} from 'recharts';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartType, setChartType] = useState('bar'); // bar, area, line
  const [isLogActive, setIsLogActive] = useState(true);
  const [logs, setLogs] = useState([
    { id: 1, time: '10:48:15', type: 'query', method: 'GET', path: '/api/cities', status: 200, latency: '14ms', sql: 'SELECT * FROM "City" ORDER BY "popularityScore" DESC' },
    { id: 2, time: '10:48:19', type: 'mutation', method: 'POST', path: '/api/trips', status: 201, latency: '23ms', sql: 'INSERT INTO "Trip" ("id", "title", "userId") VALUES (?, ?, ?)' },
    { id: 3, time: '10:48:22', type: 'query', method: 'GET', path: '/api/admin/analytics', status: 200, latency: '8ms', sql: 'SELECT COUNT(*) FROM "User" UNION SELECT COUNT(*) FROM "Trip"...' },
    { id: 4, time: '10:48:26', type: 'query', method: 'GET', path: '/api/health', status: 200, latency: '3ms', sql: 'SELECT 1' }
  ]);

  const { data: analyticsData, isLoading, error, refetch: refetchAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const res = await adminApi.getAnalytics();
      return res.data.analytics;
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

  // Simulated SQL logger
  useEffect(() => {
    if (!isLogActive) return;
    const routes = [
      { method: 'GET', path: '/api/cities', sql: 'SELECT * FROM "City" LIMIT 16' },
      { method: 'GET', path: '/api/activities', sql: 'SELECT * FROM "Activity" WHERE "cityId" = ?' },
      { method: 'POST', path: '/api/trips', sql: 'INSERT INTO "TripStop" ("id", "tripId", "cityId") VALUES (?, ?, ?)' },
      { method: 'GET', path: '/api/users/profile', sql: 'SELECT * FROM "User" WHERE "id" = ? LIMIT 1' },
      { method: 'PUT', path: '/api/trips/share', sql: 'UPDATE "Trip" SET "isPublic" = true WHERE "id" = ?' },
      { method: 'GET', path: '/api/health', sql: 'SELECT 1' }
    ];

    const interval = setInterval(() => {
      const route = routes[Math.floor(Math.random() * routes.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const latencyVal = Math.floor(Math.random() * 20) + 2;
      const statusVal = Math.random() > 0.95 ? 404 : 200;
      
      setLogs((prev) => [
        {
          id: Date.now(),
          time: timeStr,
          type: route.method === 'GET' ? 'query' : 'mutation',
          method: route.method,
          path: route.path,
          status: statusVal,
          latency: `${latencyVal}ms`,
          sql: route.sql
        },
        ...prev.slice(0, 14) // keep last 15 logs
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLogActive]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchAnalytics(), refetchHealth()]);
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
        <p className="text-xs text-slate-400">Please make sure the backend database connection is active.</p>
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

  // Prepare chart data
  const chartData = [
    { name: 'Users', count: overview.totalUsers, fill: '#3b82f6' },
    { name: 'Trips', count: overview.totalTrips, fill: '#8b5cf6' },
    { name: 'Shares', count: overview.totalShares, fill: '#10b981' },
    { name: 'Cities', count: overview.totalCities, fill: '#f59e0b' },
    { name: 'Activities', count: overview.totalActivities, fill: '#ec4899' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const getUnitLabel = (name) => {
        if (name === 'Users') return 'registered accounts';
        if (name === 'Trips') return 'planned itineraries';
        if (name === 'Shares') return 'shared gallery items';
        if (name === 'Cities') return 'destination cities';
        return 'curated things to do';
      };
      
      return (
        <div className="glass-card border border-slate-800/80 p-3.5 rounded-2xl text-xs shadow-2xl bg-slate-950/95 backdrop-blur-md min-w-[160px] space-y-1 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full shadow-glow" style={{ backgroundColor: data.fill }}></span>
            <p className="font-black text-slate-205 text-sm tracking-tight">{data.name}</p>
          </div>
          <div className="pt-1.5 border-t border-slate-900 space-y-0.5">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Database Count</p>
            <p className="text-white font-extrabold text-base flex items-baseline gap-1.5">
              <span>{payload[0].value}</span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">{getUnitLabel(data.name)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'sightseeing': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'food': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'adventure': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'culture': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'nightlife': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }} barSize={28}>
              <defs>
                <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="gradTrips" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="gradShares" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#047857" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="gradCities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#b45309" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="gradActivities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.85}/>
                  <stop offset="100%" stopColor="#be185d" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(51, 65, 85, 0.12)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.015)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => {
                  const grads = ['url(#gradUsers)', 'url(#gradTrips)', 'url(#gradShares)', 'url(#gradCities)', 'url(#gradActivities)'];
                  return <Cell key={`cell-${index}`} fill={grads[index]} stroke={entry.fill} strokeWidth={1} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight leading-none">
              Platform Administration Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex items-center gap-1.5">
              <span>Real database aggregate metrics calculated directly in the</span>
              <span className="font-bold text-emerald-400 underline decoration-emerald-550/30">{dbName}</span>
              <span>database.</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="self-start sm:self-center inline-flex items-center space-x-2 px-4 py-2 bg-slate-905 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all shadow-inner"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Tab Controls */}
      <div className="relative flex bg-slate-950/60 p-1 border border-slate-850/30 rounded-2xl inline-flex backdrop-blur-md overflow-x-auto max-w-full scrollbar-none">
        {/* Sliding Indicator Pill */}
        <div 
          className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-blue-600/15 to-indigo-600/15 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.12)] transition-all duration-300 ease-out pointer-events-none"
          style={{
            width: 'calc(25% - 4px)',
            transform: `translateX(${activeTab === 'overview' ? '0%' : activeTab === 'cities' ? '100%' : activeTab === 'activities' ? '200%' : '300%'})`,
            left: activeTab === 'overview' ? '4px' : activeTab === 'cities' ? '5px' : activeTab === 'activities' ? '6px' : '7px'
          }}
        />

        {[
          { id: 'overview', label: 'System Overview', icon: Layers },
          { id: 'cities', label: 'Destination Insights', icon: Globe },
          { id: 'activities', label: 'Activity Insights', icon: Activity },
          { id: 'system', label: 'System Diagnostics', icon: Cpu }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 z-10 w-44 shrink-0 ${
                isActive
                  ? 'text-blue-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TabIcon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Total Users', count: overview.totalUsers, desc: 'Registered user accounts', icon: Users, color: 'text-blue-400 bg-blue-500/10' },
              { label: 'Total Planned Trips', count: overview.totalTrips, desc: 'Created multi-stop itineraries', icon: Map, color: 'text-purple-400 bg-purple-500/10' },
              { label: 'Public Shared / Copies', count: `${overview.publicTrips} / ${overview.totalShares}`, desc: 'Shared trips and copies', icon: Share2, color: 'text-emerald-400 bg-emerald-500/10' },
              { label: 'Database Cities', count: overview.totalCities, desc: 'Available global destinations', icon: Building2, color: 'text-amber-400 bg-amber-500/10' },
              { label: 'Available Activities', count: overview.totalActivities, desc: 'Curated things to do', icon: Ticket, color: 'text-pink-400 bg-pink-500/10' },
              { label: 'Active Connection', count: dbName, desc: dbText, icon: Database, color: 'text-indigo-400 bg-indigo-500/10' }
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

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-850 lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-base text-white">Database Volume Analytics</h3>
                  <p className="text-[10px] text-slate-500">Record quantities aggregated dynamically by type</p>
                </div>
                {/* Advanced Chart Controls */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px] font-bold text-slate-400">
                  {['bar', 'area', 'line'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                        chartType === type 
                          ? 'bg-slate-800 text-white font-extrabold shadow-inner' 
                          : 'hover:text-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 pt-2">
                {renderChart()}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-slate-850 flex flex-col justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white mb-4">Diagnostics Feed</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-bold text-slate-200">{dbName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">Connection State</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <span>Connected</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400">API Port Listener</span>
                    <span className="font-bold text-slate-200">5000</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-400">Seed Status</span>
                    <span className="font-bold text-emerald-400">Complete</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900">
                <button 
                  onClick={() => setActiveTab('system')} 
                  className="w-full inline-flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-350 hover:text-white rounded-xl transition-all"
                >
                  <span>Open System Diagnostics</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


        </div>
      )}

      {activeTab === 'cities' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <div>
            <h3 className="font-display font-black text-xl text-white">Top Destination Cities</h3>
            <p className="text-xs text-slate-400">Ranked by user popularity indices and cost multiplier thresholds</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCities.map((city, idx) => (
              <div key={city.id} className="flex p-3 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 rounded-2xl gap-4 transition-all">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />
                  <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-brand-400 flex items-center justify-center font-bold text-xs">
                    #{idx + 1}
                  </span>
                </div>

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

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Cost Index</span>
                      </span>
                      <span className="text-emerald-400 font-extrabold text-xs">{city.costIndex ? `${city.costIndex}x` : '1.0x'}</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850 p-px">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${Math.min(((city.costIndex || 1.0) / 2.5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
          <div>
            <h3 className="font-display font-black text-xl text-white">Most Added Activities</h3>
            <p className="text-xs text-slate-400">Total itinerary frequency count aggregated across all created trips</p>
          </div>

          <div className="space-y-3">
            {popularActivities.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3">No activities added to trips yet.</p>
            ) : (
              popularActivities.map((act, idx) => (
                <div key={act.id} className="flex items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl border border-slate-850 transition-all">
                  <div className="flex items-center space-x-4">
                    <span className="w-6 text-center font-bold text-xs text-purple-400">#{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{act.name}</h4>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">{act.cityName}</span>
                        <span className="text-slate-700">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getCategoryColor(act.category)}`}>
                          {act.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-blue-600/10 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20">
                    Included in <strong className="text-white font-extrabold">{act.usageCount}</strong> trips
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white">System Diagnostics Panel</h3>
                <p className="text-xs text-slate-400">Live operational specs and application architecture settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900">
              {/* Database Cards */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Database Instance Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Active Engine */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Engine</p>
                      <p className="text-sm font-bold text-white mt-0.5">{dbName}</p>
                    </div>
                  </div>

                  {/* Connection Status */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className={`p-2 rounded-xl border ${healthData?.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-450 border-rose-500/20'}`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Connection Status</p>
                      <p className={`text-xs font-bold mt-0.5 ${healthData?.status === 'healthy' ? 'text-emerald-400' : 'text-rose-450'}`}>
                        {healthData?.status === 'healthy' ? 'Active' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  {/* ORM Version */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Prisma Client ORM</p>
                      <p className="text-sm font-bold text-white mt-0.5">v5.22.0</p>
                    </div>
                  </div>

                  {/* Engine Type */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Engine Type</p>
                      <p className="text-xs font-bold text-white mt-0.5">Library (Node-API)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environment Cards */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Environment Specs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Node Version */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Node.js Runtime</p>
                      <p className="text-sm font-bold text-white mt-0.5">v24.8.0</p>
                    </div>
                  </div>

                  {/* Process Mode */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Process State</p>
                      <p className="text-sm font-bold text-white mt-0.5">Development</p>
                    </div>
                  </div>

                  {/* Port Listener */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">API Port Listener</p>
                      <p className="text-sm font-bold text-white mt-0.5">5000</p>
                    </div>
                  </div>

                  {/* CORS */}
                  <div className="glass-card rounded-2xl p-4 border border-slate-850/60 flex items-center space-x-3.5 hover:border-slate-800 transition-colors bg-slate-950/20">
                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">CORS Origin</p>
                      <p className="text-[10px] font-bold text-slate-200 mt-1 truncate max-w-[120px]" title="http://localhost:5173">
                        http://localhost:5173
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
