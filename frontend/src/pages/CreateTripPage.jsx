import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../services/tripApi.js';
import toast from 'react-hot-toast';
import { Map, Calendar, Image, FileText, ArrowRight, Share2 } from 'lucide-react';

export const CreateTripPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleCovers = [
    { city: 'Paris', country: 'France', flag: '🇫🇷', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' },
    { city: 'Tokyo', country: 'Japan', flag: '🇯🇵', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80' },
    { city: 'Rome', country: 'Italy', flag: '🇮🇹', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
    { city: 'New York', country: 'United States', flag: '🇺🇸', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80' },
    { city: 'London', country: 'United Kingdom', flag: '🇬🇧', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&auto=format&fit=crop&q=80' },
    { city: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80' },
    { city: 'Sydney', country: 'Australia', flag: '🇦🇺', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80' },
    { city: 'Venice', country: 'Italy', flag: '🇮🇹', url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&auto=format&fit=crop&q=80' },
    { city: 'Cairo', country: 'Egypt', flag: '🇪🇬', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop&q=80' },
    { city: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&auto=format&fit=crop&q=80' },
    { city: 'Barcelona', country: 'Spain', flag: '🇪🇸', url: 'https://images.unsplash.com/photo-1583422409516-2895a771df60?w=800&auto=format&fit=crop&q=80' },
    { city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&auto=format&fit=crop&q=80' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(startDate) > new Date(endDate)) {
      setError('Departure date cannot be before arrival date.');
      return;
    }

    setLoading(true);
    try {
      const res = await tripApi.createTrip({
        name,
        description,
        startDate,
        endDate,
        coverPhotoUrl: coverPhotoUrl || sampleCovers[0].url,
        isPublic,
      });

      toast.success('Trip created! Adding itinerary stops next...');
      navigate(`/trips/${res.data.trip.id}/builder`);
    } catch (err) {
      setError(err.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-4xl text-white bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent">
          Plan a New Multi-City Trip
        </h1>
        <p className="text-sm text-slate-400 flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Set your trip name and dates to launch your itinerary builder</span>
        </p>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-rose-500/10 to-rose-600/10 border border-rose-500/30 text-rose-400 rounded-2xl text-sm font-medium backdrop-blur-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-800/50 space-y-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Map className="w-4 h-4 text-brand-400" />
            <span>Trip Name <span className="text-rose-400">*</span></span>
          </label>
          <div className="relative group">
            <Map className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grand European Summer Escapade"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>Start Date <span className="text-rose-400">*</span></span>
            </label>
            <div className="relative group">
              <Calendar className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>End Date <span className="text-rose-400">*</span></span>
            </label>
            <div className="relative group">
              <Calendar className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <span>Description</span>
          </label>
          <div className="relative group">
            <FileText className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add trip notes, travel goals, or co-planner details..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Image className="w-4 h-4 text-brand-400" />
            <span>Select Cover Photo</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sampleCovers.map((cover, i) => {
              const isSelected = coverPhotoUrl === cover.url || (!coverPhotoUrl && i === 0);
              return (
                <div
                  key={i}
                  onClick={() => setCoverPhotoUrl(cover.url)}
                  className={`group relative h-28 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300 transform hover:scale-105 shadow-md ${
                    isSelected
                      ? 'border-cyan-400 ring-4 ring-cyan-500/30 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                      : 'border-slate-800/80 opacity-80 hover:opacity-100 hover:border-slate-600'
                  }`}
                >
                  <img src={cover.url} alt={`${cover.city}, ${cover.country}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  
                  {/* Selected Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 z-20 w-5 h-5 bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <span className="text-white text-[10px] font-black">✓</span>
                    </div>
                  )}

                  {/* Hover Country & City Name Badge Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 z-10">
                    <p className="text-white text-xs font-black flex items-center space-x-1.5 drop-shadow-md">
                      <span className="text-sm">{cover.flag}</span>
                      <span className="truncate">{cover.city}, {cover.country}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative group">
            <Image className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="url"
              value={coverPhotoUrl}
              onChange={(e) => setCoverPhotoUrl(e.target.value)}
              placeholder="Or paste custom image URL"
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-2">
          <div className="relative">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 rounded-xl border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer transition-all"
            />
          </div>
          <label htmlFor="isPublic" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center space-x-2">
            <span>Make trip publicly accessible via shareable link</span>
            <Share2 className="w-4 h-4 text-emerald-400" />
          </label>
        </div>

        <div className="pt-6 border-t border-slate-800/50 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="px-6 py-3 text-sm font-medium text-slate-400 hover:text-white rounded-2xl transition-all hover:bg-slate-800/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 transform hover:scale-105 group"
          >
            <span>{loading ? 'Creating Trip...' : 'Continue to Itinerary Builder'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
};
