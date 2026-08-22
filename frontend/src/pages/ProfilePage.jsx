import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../services/userApi.js';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import toast from 'react-hot-toast';
import { User, Mail, Globe, Camera, Trash2, Save, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [languagePreference, setLanguagePreference] = useState(user?.languagePreference || 'en');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.profilePhotoUrl || '');
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.updateProfile({ name, languagePreference, profilePhotoUrl });
      updateUserProfile(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      logout();
      toast.success('Account deleted successfully.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="font-display font-bold text-4xl text-white bg-gradient-to-r from-white via-brand-200 to-brand-400 bg-clip-text text-transparent">
          Profile & Preferences
        </h1>
        <p className="text-sm text-slate-400 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span>Manage your user information and account settings</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-800/50 space-y-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-8 border-b border-slate-800/50">
          <div className="relative group">
            <img
              src={profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-500/30 group-hover:ring-brand-500/50 transition-all duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h3 className="font-display font-bold text-2xl text-white">{user?.name}</h3>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start space-x-2">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </p>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-500/20 to-brand-400/20 text-brand-300 text-xs font-bold uppercase rounded-xl border border-brand-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Explorer</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <User className="w-4 h-4 text-brand-400" />
            <span>Full Name</span>
          </label>
          <div className="relative group">
            <User className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-brand-400" />
            <span>Email Address (Read-Only)</span>
          </label>
          <div className="relative group">
            <Mail className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm opacity-60 cursor-not-allowed bg-slate-900/50"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Camera className="w-4 h-4 text-brand-400" />
            <span>Profile Photo Image URL</span>
          </label>
          <div className="relative group">
            <Camera className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <input
              type="url"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Language Preference</span>
          </label>
          <div className="relative group">
            <Globe className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
            <select
              value={languagePreference}
              onChange={(e) => setLanguagePreference(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-sm bg-slate-900 focus:ring-2 focus:ring-brand-500/50 transition-all group-hover:border-brand-500/30 appearance-none cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="text-sm text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-2 px-4 py-2.5 rounded-xl hover:bg-rose-500/10 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 transform hover:scale-105 group"
          >
            <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="This action will delete your account, all associated trips, stops, activities, and shared links permanently."
        confirmText="Delete My Account"
      />
    </div>
  );
};
