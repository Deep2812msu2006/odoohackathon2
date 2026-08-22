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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Profile & Preferences</h1>
        <p className="text-sm text-slate-400">Manage your user information and account settings</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-800">
          <img
            src={profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-brand-500/30"
          />
          <div>
            <h3 className="font-display font-bold text-lg text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase rounded-md border border-brand-500/30">
              Verified Explorer
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Email Address (Read-Only)
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Profile Photo Image URL
          </label>
          <div className="relative">
            <Camera className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="url"
              value={profilePhotoUrl}
              onChange={(e) => setProfilePhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Language Preference
          </label>
          <div className="relative">
            <Globe className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <select
              value={languagePreference}
              onChange={(e) => setLanguagePreference(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl glass-input text-sm bg-slate-900"
            >
              <option value="en">English (US)</option>
              <option value="fr">French (Français)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ja">Japanese (日本語)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm rounded-xl shadow-glow flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
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
