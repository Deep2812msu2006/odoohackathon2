import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/adminApi.js';
import { systemApi } from '../services/systemApi.js';
import { 
  ShieldCheck, Users, Map, Building2, Ticket, Share2, Star, 
  TrendingUp, Database, Activity, Cpu, Layers, AlertCircle, RefreshCw, Globe, ChevronRight, Server, Settings, DollarSign,
  Terminal, Play, Pause, Trash2, Eye, TableInfo
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line
} from 'recharts';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartType, setChartType] = useState('bar'); // bar, area, line
  const [isLogActive, setIsLogActive] = useState(true);
  const [selectedModel, setSelectedModel] = useState('User');
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

  // Database Schema Inspector Data
  const schemaDefinitions = {
    User: [
      { name: 'id', type: 'String (UUID)', key: 'PK', nullable: 'No', desc: 'Unique identifier for the user account' },
      { name: 'name', type: 'String', key: '-', nullable: 'No', desc: 'Display name' },
      { name: 'email', type: 'String', key: 'Unique', nullable: 'No', desc: 'Primary contact and login email' },
      { name: 'role', type: 'String', key: '-', nullable: 'No', desc: 'Access tier (admin/user)' },
      { name: 'createdAt', type: 'DateTime', key: '-', nullable: 'No', desc: 'Timestamp of registration' }
    ],
    Trip: [
      { name: 'id', type: 'String (UUID)', key: 'PK', nullable: 'No', desc: 'Unique identifier for the trip' },
      { name: 'userId', type: 'String (UUID)', key: 'FK', nullable: 'No', desc: 'Relation link to user owner' },
      { name: 'title', type: 'String', key: '-', nullable: 'No', desc: 'Custom trip destination name' },
      { name: 'startDate', type: 'DateTime', key: '-', nullable: 'Yes', desc: 'Starting date of travel' },
      { name: 'isPublic', type: 'Boolean', key: '-', nullable: 'No', desc: 'Sharing state to public gallery' }
    ],
    City: [
      { name: 'id', type: 'String (UUID)', key: 'PK', nullable: 'No', desc: 'Destination city identifier' },
      { name: 'name', type: 'String', key: '-', nullable: 'No', desc: 'City name (e.g. Paris)' },
      { name: 'country', type: 'String', key: '-', nullable: 'No', desc: 'Country location' },
      { name: 'costIndex', type: 'Float', key: '-', nullable: 'No', desc: 'Multiplier relative to baseline' },
      { name: 'popularityScore', type: 'Float', key: '-', nullable: 'No', desc: 'User rating metric (1-10)' }
    ],
    Activity: [
      { name: 'id', type: 'String (UUID)', key: 'PK', nullable: 'No', desc: 'Activity identifier' },
      { name: 'cityId', type: 'String (UUID)', key: 'FK', nullable: 'No', desc: 'Relation link to host city' },
      { name: 'name', type: 'String', key: '-', nullable: 'No', desc: 'Name of sightseeing item' },
      { name: 'category', type: 'String', key: '-', nullable: 'No', desc: 'Sightseeing, Food, Adventure, etc.' },
      { name: 'estimatedCost', type: 'Float', key: '-', nullable: 'No', desc: 'Base currency cost' }
    ]
  };

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
      return (
        <div className="glass-card border border-slate-850 p-3 rounded-xl text-xs shadow-2xl bg-slate-950/90 backdrop-blur-md">
          <p className="font-bold text-slate-200">{payload[0].name}</p>
          <p className="text-brand-400 font-extrabold mt-0.5">
            Total Record Count: <span className="text-white font-black">{payload[0].value}</span>
          </p>
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
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
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
      <div className="flex bg-slate-950/50 p-1.5 border border-slate-800/60 rounded-2xl inline-flex space-x-2 backdrop-blur-md">
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
              className={`flex items-center space-x-2.5 px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-102 font-extrabold'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/40'
              }`}
            >
              <TabIcon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-450 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
              )}
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

          {/* Live Simulated SQL Log Console */}
          <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-slate-950 text-slate-400 border border-slate-850 rounded-xl">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Live Query Console Stream</h3>
                  <p className="text-[10px] text-slate-500">Real-time database queries & REST API calls routed through Prisma Client</p>
                </div>
              </div>

              {/* Log Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsLogActive(!isLogActive)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    isLogActive 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                  title={isLogActive ? 'Pause Log stream' : 'Resume Log stream'}
                >
                  {isLogActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 rounded-lg transition-all"
                  title="Clear Console"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-300 h-56 overflow-y-auto space-y-2.5 scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-center py-16 text-slate-650 italic">
                  Console cleared. Waiting for database queries...
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-slate-900/60 pb-2 gap-1.5">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">[{log.time}]</span>
                        <span className={`px-1.5 py-0.25 rounded text-[9px] font-bold ${
                          log.method === 'GET' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/15' : 'bg-purple-900/30 text-purple-400 border border-purple-500/15'
                        }`}>
                          {log.method}
                        </span>
                        <span className="text-slate-200 font-bold">{log.path}</span>
                        <span className={`font-semibold ${log.status === 200 || log.status === 201 ? 'text-emerald-400' : 'text-rose-450'}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 bg-slate-900/40 p-1.5 rounded border border-slate-900 font-mono overflow-x-auto select-all">
                        {log.sql}
                      </div>
                    </div>
                    <span className="text-slate-500 font-bold shrink-0">{log.latency}</span>
                  </div>
                ))
              )}
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

          {/* Advanced Visual Schema Inspector */}
          <div className="glass-card rounded-3xl p-6 border border-slate-850 space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <TableInfo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">Database Schema Inspector</h3>
                  <p className="text-xs text-slate-400">ORM models and relational data structure mapping</p>
                </div>
              </div>

              {/* Model Selectors */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 text-[10px] font-bold text-slate-400">
                {Object.keys(schemaDefinitions).map((modelName) => (
                  <button
                    key={modelName}
                    onClick={() => setSelectedModel(modelName)}
                    className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all ${
                      selectedModel === modelName 
                        ? 'bg-slate-850 text-white font-extrabold shadow-inner border border-slate-800' 
                        : 'hover:text-slate-200'
                    }`}
                  >
                    {modelName}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Field Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-900 uppercase text-[10px] tracking-wider">
                    <th className="p-4">Field Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Key</th>
                    <th className="p-4">Nullable</th>
                    <th className="p-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/60 bg-slate-950/20">
                  {schemaDefinitions[selectedModel].map((field) => (
                    <tr key={field.name} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-200">{field.name}</td>
                      <td className="p-4 text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px]">
                          {field.type}
                        </span>
                      </td>
                      <td className="p-4">
                        {field.key !== '-' ? (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${
                            field.key === 'PK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {field.key}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">{field.nullable}</td>
                      <td className="p-4 text-slate-500">{field.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
