import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { formatCurrency } from '../utils/formatters.js';
import toast from 'react-hot-toast';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine
} from 'recharts';
import {
  DollarSign, AlertTriangle, ArrowLeft, Calendar, Building2, CheckCircle2,
  TrendingUp, Sparkles, PlusCircle, Trash2, Plus, RefreshCw, Layers, Tag
} from 'lucide-react';

export const BudgetDashboardPage = () => {
  const { id: tripId } = useParams();
  const [targetBudgetInput, setTargetBudgetInput] = useState(150);
  
  // Custom interactive expenses added by user directly on the budget page
  const [customExpenses, setCustomExpenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('accommodation');
  const [newCost, setNewCost] = useState('');
  const [newDate, setNewDate] = useState('');

  const { data: serverBudgetData, isLoading } = useQuery({
    queryKey: ['budget', tripId, targetBudgetInput],
    queryFn: async () => {
      const res = await tripApi.getTripBudget(tripId, targetBudgetInput);
      return res.data.budget;
    },
  });

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-slate-400">Calculating dynamic budget analytics...</p>
      </div>
    );
  }

  const baseBudget = serverBudgetData || {
    categories: { activities: 0, accommodation: 0, transport: 0, meals: 0, total: 0 },
    totalDays: 7,
    dailyAverage: 0,
    isOverallOverBudget: false,
    overBudgetDaysCount: 0,
    cityBreakdown: [],
    dailySpending: []
  };

  // Merge server budget data with user's custom interactive expenses
  const customTotal = customExpenses.reduce((sum, item) => sum + item.cost, 0);
  const customActivities = customExpenses.filter(i => i.category === 'activities').reduce((sum, item) => sum + item.cost, 0);
  const customAccom = customExpenses.filter(i => i.category === 'accommodation').reduce((sum, item) => sum + item.cost, 0);
  const customTransport = customExpenses.filter(i => i.category === 'transport').reduce((sum, item) => sum + item.cost, 0);
  const customMeals = customExpenses.filter(i => i.category === 'meals').reduce((sum, item) => sum + item.cost, 0);

  const categories = {
    activities: (baseBudget.categories?.activities || 0) + customActivities,
    accommodation: (baseBudget.categories?.accommodation || 0) + customAccom,
    transport: (baseBudget.categories?.transport || 0) + customTransport,
    meals: (baseBudget.categories?.meals || 0) + customMeals,
    total: (baseBudget.categories?.total || 0) + customTotal
  };

  const totalDays = baseBudget.totalDays || 7;
  const dailyAverage = totalDays > 0 ? categories.total / totalDays : 0;
  const isOverallOverBudget = dailyAverage > targetBudgetInput;

  const hasExpenses = categories.total > 0 || (baseBudget.cityBreakdown && baseBudget.cityBreakdown.length > 0);

  const pieData = [
    { name: 'Activities', value: categories.activities, color: '#36a9f7' },
    { name: 'Accommodation', value: categories.accommodation, color: '#a855f7' },
    { name: 'Transport', value: categories.transport, color: '#f59e0b' },
    { name: 'Meals', value: categories.meals, color: '#10b981' },
  ].filter((item) => item.value > 0);

  // Populate realistic sample trip expenses
  const handleAutoPopulateSample = () => {
    const today = new Date().toISOString().split('T')[0];
    const samples = [
      { id: Date.now() + 1, name: 'Boutique Hotel Booking', category: 'accommodation', cost: 180, date: today },
      { id: Date.now() + 2, name: 'Gourmet French Dinner', category: 'meals', cost: 65, date: today },
      { id: Date.now() + 3, name: 'High Speed Express Train', category: 'transport', cost: 45, date: today },
      { id: Date.now() + 4, name: 'Museum Guided Tour Pass', category: 'activities', cost: 35, date: today },
    ];
    setCustomExpenses(prev => [...prev, ...samples]);
    toast.success('Sample trip expenses populated! Dynamic charts updated.', { icon: '⚡' });
  };

  // Add a single custom expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newTitle || !newCost) {
      toast.error('Please enter expense title and cost amount.');
      return;
    }
    const costVal = parseFloat(newCost);
    if (isNaN(costVal) || costVal <= 0) {
      toast.error('Please enter a valid positive cost amount.');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newTitle,
      category: newCategory,
      cost: costVal,
      date: newDate || new Date().toISOString().split('T')[0]
    };

    setCustomExpenses(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewCost('');
    setNewDate('');
    setShowAddModal(false);
    toast.success(`Added "${newItem.name}" ($${costVal}) to trip budget!`, { icon: '💰' });
  };

  const handleDeleteCustomExpense = (id) => {
    setCustomExpenses(prev => prev.filter(item => item.id !== id));
    toast.success('Expense item removed');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link to={`/trips/${tripId}/builder`} className="text-xs text-brand-400 font-bold flex items-center space-x-1 mb-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary Builder</span>
          </Link>
          <h1 className="font-display font-black text-3xl text-white tracking-tight">Dynamic Budget Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time cost engine computed from trip stops, activities & custom expenses</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Target Daily Budget Input */}
          <div className="glass-card px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center space-x-3 shadow-lg">
            <label className="text-xs text-slate-300 font-bold">Target Daily Budget ($):</label>
            <input
              type="number"
              value={targetBudgetInput}
              onChange={(e) => setTargetBudgetInput(parseFloat(e.target.value) || 0)}
              className="w-20 px-2.5 py-1 rounded-xl glass-input text-xs font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Warning Alert if Over Budget */}
      {isOverallOverBudget && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-amber-300 shadow-lg animate-pulse">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-amber-300 text-sm">Over-Budget Warning!</p>
            <p className="text-slate-300 mt-0.5">
              Your daily average spending ({formatCurrency(dailyAverage)}) exceeds your target daily budget threshold ({formatCurrency(targetBudgetInput)}).
            </p>
          </div>
        </div>
      )}

      {/* Quick Action Toolbar if Expenses is $0 */}
      {!hasExpenses && (
        <div className="glass-card rounded-3xl p-8 text-center space-y-4 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-brand-950/20 to-slate-950 shadow-2xl">
          <div className="p-3.5 bg-brand-500/10 text-brand-400 rounded-2xl w-fit mx-auto border border-brand-500/20 shadow-glow">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black text-xl text-white">No Expense Records Found Yet</h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Add your accommodation, transport, meals, or activity expenses to compute daily budgets and visual category breakdowns!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-xs rounded-xl shadow-glow inline-flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom Expense</span>
            </button>
            <button
              onClick={handleAutoPopulateSample}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-extrabold text-xs rounded-xl border border-cyan-500/30 shadow-lg inline-flex items-center space-x-2 transition-all transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Auto-Populate Sample Trip Expenses</span>
            </button>
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calculated Cost</p>
          <p className="font-display text-3xl font-black text-white mt-1">{formatCurrency(categories.total)}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">{totalDays} Days Journey</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Average</p>
          <p className="font-display text-3xl font-black text-brand-400 mt-1">{formatCurrency(dailyAverage)}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Per day spending</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activities Total</p>
          <p className="font-display text-3xl font-black text-purple-400 mt-1">{formatCurrency(categories.activities)}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Scheduled activity links</p>
        </div>

        <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Status</p>
          <p className={`font-display text-xl font-black mt-1 ${isOverallOverBudget ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isOverallOverBudget ? 'Exceeds Target' : 'Within Target'}
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            Target: {formatCurrency(targetBudgetInput)}/day
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Expense Category Breakdown</h3>
            <span className="text-[10px] font-bold uppercase text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
              Live Allocation
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'No Expenses', value: 1, color: '#334155' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {(pieData.length > 0 ? pieData : [{ name: 'No Expenses', value: 1, color: '#334155' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-400 font-medium">{item.name}:</span>
                <span className="font-bold text-white ml-auto">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Daily Spending vs Target</h3>
            <span className="text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Threshold Engine
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={baseBudget.dailySpending.length > 0 ? baseBudget.dailySpending : [
                { date: 'Day 1', activities: categories.activities, accommodation: categories.accommodation, meals: categories.meals, transport: categories.transport }
              ]}>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <ReferenceLine y={targetBudgetInput} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10 }} />
                <Bar dataKey="activities" name="Activities" stackId="a" fill="#36a9f7" />
                <Bar dataKey="accommodation" name="Accom." stackId="a" fill="#a855f7" />
                <Bar dataKey="meals" name="Meals" stackId="a" fill="#10b981" />
                <Bar dataKey="transport" name="Transport" stackId="a" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recorded Custom Expenses Ledger Table */}
      {customExpenses.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white">Custom Expense Ledger</h3>
            <span className="text-xs text-slate-400 font-semibold">{customExpenses.length} items logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Cost</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {customExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{exp.name}</td>
                    <td className="py-3 px-4 uppercase text-[10px] font-extrabold tracking-wider">
                      <span className={`px-2 py-0.5 rounded-full ${
                        exp.category === 'accommodation' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        exp.category === 'meals' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        exp.category === 'transport' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{exp.date}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400">{formatCurrency(exp.cost)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteCustomExpense(exp.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Custom Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-400" />
                <span>Add Custom Expense</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Expense Title / Item</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Hotel Le Marais, Train Pass"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs bg-slate-900"
                  >
                    <option value="accommodation">Accommodation 🏢</option>
                    <option value="meals">Meals / Dining 🍕</option>
                    <option value="transport">Transport 🚕</option>
                    <option value="activities">Activities 🎟️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cost Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    placeholder="120.00"
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-emerald-400 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Date (Optional)</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-brand-400"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
