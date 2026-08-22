import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripApi } from '../services/tripApi.js';
import toast from 'react-hot-toast';
import { Map, Calendar, Image, FileText, ArrowRight } from 'lucide-react';

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
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=80',
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
        coverPhotoUrl: coverPhotoUrl || sampleCovers[0],
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Plan a New Multi-City Trip</h1>
        <p className="text-sm text-slate-400">Set your trip name and dates to launch your itinerary builder</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Trip Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Map className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grand European Summer Escapade"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Start Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              End Date <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add trip notes, travel goals, or co-planner details..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Cover Photo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {sampleCovers.map((url, i) => (
              <div
                key={i}
                onClick={() => setCoverPhotoUrl(url)}
                className={`h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  coverPhotoUrl === url || (!coverPhotoUrl && i === 0)
                    ? 'border-brand-500 ring-2 ring-brand-500/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={url} alt={`Cover ${i}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="relative">
            <Image className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="url"
              value={coverPhotoUrl}
              onChange={(e) => setCoverPhotoUrl(e.target.value)}
              placeholder="Or paste custom image URL"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
          />
          <label htmlFor="isPublic" className="text-sm font-medium text-slate-300 cursor-pointer">
            Make trip publicly accessible via shareable link
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm rounded-xl shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Trip...' : 'Continue to Itinerary Builder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
