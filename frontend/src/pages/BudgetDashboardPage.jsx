import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '../services/tripApi.js';
import { formatCurrency } from '../utils/formatters.js';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ReferenceLine
} from 'recharts';
import { DollarSign, AlertTriangle, ArrowLeft, Calendar, Building2, CheckCircle2, TrendingUp } from 'lucide-react';

export const BudgetDashboardPage = () => {
  const { id: tripId } = useParams();
  const [targetBudgetInput, setTargetBudgetInput] = useState(150);

  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget', tripId, targetBudgetInput],
    queryFn: async () => {
      const res = await tripApi.getTripBudget(tripId, targetBudgetInput);
      return res.data.budget;
    },
  });

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 space-y-2">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Calculating dynamic budget statistics...</p>
      </div>
    );
  }

  if (!budgetData) {
    return <div className="text-center py-12 text-rose-400">Budget information unavailable.</div>;
  }

  const {
    categories,
    totalDays,
    dailyAverage,
    isOverallOverBudget,
    overBudgetDaysCount,
    cityBreakdown,
    dailySpending,
  } = budgetData;

  const pieData = [
    { name: 'Activities', value: categories.activities, color: '#36a9f7' },
    { name: 'Accommodation', value: categories.accommodation, color: '#a855f7' },
    { name: 'Transport', value: categories.transport, color: '#f59e0b' },
    { name: 'Meals', value: categories.meals, color: '#10b981' },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to={`/trips/${tripId}/builder`} className="text-xs text-brand-400 font-semibold flex items-center space-x-1 mb-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary Builder</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">Dynamic Budget Engine</h1>
          <p className="text-xs text-slate-400">Real-time cost calculations derived from PostgreSQL trip stops & activities</p>
        </div>

        {/* Daily Target Budget Setter */}
        <div className="glass-card p-3 rounded-2xl border border-slate-800 flex items-center space-x-3">
          <label className="text-xs text-slate-300 font-medium">Target Daily Budget ($):</label>
          <input
            type="number"
            value={targetBudgetInput}
            onChange={(e) => setTargetBudgetInput(parseFloat(e.target.value) || 0)}
            className="w-24 px-3 py-1.5 rounded-xl glass-input text-xs font-bold text-emerald-400"
          />
        </div>
      </div>

      {/* Warning Alert if Over Budget */}
      {isOverallOverBudget && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center space-x-3 text-amber-300">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Over-Budget Warning Detected!</p>
            <p>
              Your calculated daily average ({formatCurrency(dailyAverage)}) exceeds your target daily budget ({formatCurrency(targetBudgetInput)}). {overBudgetDaysCount} day(s) exceed daily target.
            </p>
          </div>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-xs text-slate-400">Total Calculated Cost</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{formatCurrency(categories.total)}</p>
          <p className="text-[10px] text-slate-500 mt-1">{totalDays} Days Journey</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-xs text-slate-400">Daily Average Cost</p>
          <p className="font-display text-2xl font-bold text-brand-400 mt-1">{formatCurrency(dailyAverage)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Per day spending</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-xs text-slate-400">Activities Total</p>
          <p className="font-display text-2xl font-bold text-purple-400 mt-1">{formatCurrency(categories.activities)}</p>
          <p className="text-[10px] text-slate-500 mt-1">Scheduled activity links</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <p className="text-xs text-slate-400">Budget Status</p>
          <p className={`font-display text-lg font-bold mt-1 ${isOverallOverBudget ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isOverallOverBudget ? 'Exceeds Target' : 'Within Target'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">{overBudgetDaysCount} peak spending days</p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Expense Category Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Spending Bar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-lg text-white">Daily Spending vs Target</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpending}>
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

      {/* City Breakdown Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-lg text-white">City-by-City Expense Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Activities</th>
                <th className="py-3 px-4">Accommodation</th>
                <th className="py-3 px-4">Transport</th>
                <th className="py-3 px-4">Meals</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {cityBreakdown.map((city) => (
                <tr key={city.cityId} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-bold text-white">{city.cityName} ({city.country})</td>
                  <td className="py-3 px-4">{city.stopDays} days</td>
                  <td className="py-3 px-4">{formatCurrency(city.activitiesCost)}</td>
                  <td className="py-3 px-4">{formatCurrency(city.accommodationCost)}</td>
                  <td className="py-3 px-4">{formatCurrency(city.transportCost)}</td>
                  <td className="py-3 px-4">{formatCurrency(city.mealsCost)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatCurrency(city.cityTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
