import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userApi } from '../services/userApi.js';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { UserAvatar } from '../components/UserAvatar.jsx';
import toast from 'react-hot-toast';
import {
  User, Mail, Globe, Camera, Trash2, Save, ShieldCheck, Settings,
  Lock, Bell, Eye, EyeOff, Sparkles, MapPin, Calendar, Award,
  ChevronRight, LogOut, Moon, Sun, Zap, Heart, Star, Edit3,
  CheckCircle2, AlertTriangle, Info, Palette, Upload, UploadCloud, Image as ImageIcon
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'fr', label: 'French', flag: '🇫🇷', native: 'Français' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'de', label: 'German', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', label: 'Italian', flag: '🇮🇹', native: 'Italiano' },
];

const THEMES = [
  { id: 'cosmic', label: 'Cosmic Dark', gradient: 'from-indigo-600 to-purple-700', preview: 'bg-gradient-to-br from-indigo-950 to-purple-950' },
  { id: 'ocean', label: 'Deep Ocean', gradient: 'from-cyan-600 to-blue-700', preview: 'bg-gradient-to-br from-cyan-950 to-blue-950' },
  { id: 'ember', label: 'Ember Night', gradient: 'from-rose-600 to-orange-700', preview: 'bg-gradient-to-br from-rose-950 to-orange-950' },
  { id: 'forest', label: 'Forest Dark', gradient: 'from-emerald-600 to-teal-700', preview: 'bg-gradient-to-br from-emerald-950 to-teal-950' },
];

export const ProfilePage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [languagePreference, setLanguagePreference] = useState(user?.languagePreference || 'en');
  const initialPhoto = (user?.profilePhotoUrl || '').includes('images.unsplash.com/photo-1534528741775') ? '' : (user?.profilePhotoUrl || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialPhoto);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, GIF, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image file size must be under 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress image to JPEG 0.85 quality for instant uploads
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setProfilePhotoUrl(compressedBase64);
        toast.success('Local photo loaded and optimized! Click "Save Profile" to apply.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Settings State
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem('interfaceTheme');
    return saved || 'cosmic';
  });
  const [notifications, setNotifications] = useState({
    tripReminders: true,
    budgetAlerts: true,
    shareActivity: false,
    weeklyDigest: true,
  });

  // Apply theme to document
  const applyTheme = (themeId) => {
    const body = document.body;
    body.classList.remove('theme-cosmic', 'theme-ocean', 'theme-ember', 'theme-forest');
    body.classList.add(`theme-${themeId}`);
    localStorage.setItem('interfaceTheme', themeId);

    const themeStyles = {
      cosmic: {
        '--brand-500': '#6366f1',
        '--brand-400': '#818cf8',
        '--brand-600': '#4f46e5',
      },
      ocean: {
        '--brand-500': '#06b6d4',
        '--brand-400': '#22d3ee',
        '--brand-600': '#0891b2',
      },
      ember: {
        '--brand-500': '#f97316',
        '--brand-400': '#fb923c',
        '--brand-600': '#ea580c',
      },
      forest: {
        '--brand-500': '#10b981',
        '--brand-400': '#34d399',
        '--brand-600': '#059669',
      }
    };
    
    const styles = themeStyles[themeId] || themeStyles.cosmic;
    Object.entries(styles).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
    void document.documentElement.offsetHeight;
  };

  React.useEffect(() => {
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  // Danger Zone
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Mock trip stats
  const stats = [
    { label: 'Trips Planned', value: 3, icon: MapPin, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Cities Visited', value: 7, icon: Globe, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Activities Done', value: 12, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Member Since', value: '2026', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.updateProfile({ name, languagePreference, profilePhotoUrl });
      updateUserProfile(res.data.user);
      toast.success('Profile updated successfully! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully in database! 🔒 Next login will require your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
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

  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(`Notification ${notifications[key] ? 'disabled' : 'enabled'}`);
  };

  const currentLang = LANGUAGES.find(l => l.code === languagePreference);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

      {/* ─── Hero Identity Card ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/30"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/6 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative shrink-0 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="w-28 h-28 rounded-3xl ring-4 ring-brand-500/30 ring-offset-4 ring-offset-slate-900 overflow-hidden shadow-xl shadow-brand-500/20 relative">
              <UserAvatar
                name={name}
                photoUrl={profilePhotoUrl}
                className="w-full h-full rounded-3xl group-hover:scale-105 transition-transform duration-300"
                textClassName="text-3xl"
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                <Camera className="w-6 h-6 mb-1 text-brand-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 group-hover:bg-brand-400 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 transition-colors">
              <Upload className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white">
                {user?.name}
              </h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4 text-brand-400" />
                {user?.email}
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/15 text-brand-300 text-xs font-bold rounded-xl border border-brand-500/25">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Explorer
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/25">
                <Award className="w-3.5 h-3.5" /> Pro Traveler
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/25">
                <Star className="w-3.5 h-3.5" /> {currentLang?.flag} {currentLang?.native}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 shrink-0">
            {stats.map(stat => (
              <div key={stat.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${stat.bg} border border-white/5`}>
                <stat.icon className={`w-4 h-4 ${stat.color} shrink-0`} />
                <div>
                  <div className="text-white font-bold text-sm">{stat.value}</div>
                  <div className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tab Navigation ─── */}
      <div className="glass-card rounded-2xl p-1.5 border border-slate-800/50 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group ${
              activeTab === tab.id
                ? tab.id === 'danger'
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-500/30 transform scale-105'
                  : 'bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/30 transform scale-105'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            )}
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:block relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── Profile Tab ─── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <User className="w-4 h-4 text-brand-400" />
                Display Name
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
              />
            </div>

            {/* Email (read-only) */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Mail className="w-4 h-4 text-brand-400" />
                Email Address
              </div>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm opacity-50 cursor-not-allowed"
                />
                <span className="absolute right-4 top-3.5 text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">READ-ONLY</span>
              </div>
            </div>

            {/* Profile Photo Upload & URL */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Camera className="w-4 h-4 text-brand-400" />
                  Profile Photo
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Upload file or enter URL</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative group shrink-0">
                  <UserAvatar
                    name={name}
                    photoUrl={profilePhotoUrl}
                    className="w-16 h-16 rounded-2xl ring-2 ring-brand-500/30 group-hover:ring-brand-500/60 transition-all"
                    textClassName="text-xl"
                  />
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 shrink-0 transform hover:scale-102"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Image File</span>
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={profilePhotoUrl}
                        onChange={(e) => setProfilePhotoUrl(e.target.value)}
                        placeholder="Or paste image URL (https://...)"
                        className="w-full px-4 py-3 rounded-xl glass-input text-xs focus:ring-2 focus:ring-brand-500/50 transition-all"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">Supports PNG, JPG, WebP, or GIF files up to 10MB.</p>
                </div>
              </div>
            </div>

            {/* Language - full width */}
            <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Globe className="w-4 h-4 text-brand-400" />
                Language Preference
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguagePreference(lang.code)}
                    className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all duration-300 overflow-hidden ${
                      languagePreference === lang.code
                        ? 'bg-gradient-to-br from-brand-500/20 to-brand-400/10 border-brand-500/50 text-brand-300 shadow-lg shadow-brand-500/20 scale-105'
                        : 'border-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    {languagePreference === lang.code && (
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-emerald-500/10 animate-pulse"></div>
                    )}
                    <span className="text-2xl transform group-hover:scale-110 transition-transform relative z-10">{lang.flag}</span>
                    <span className="relative z-10">{lang.label}</span>
                    {languagePreference === lang.code && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 hover:from-brand-500 hover:via-brand-400 hover:to-brand-300 text-white font-bold text-sm rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-300 flex items-center gap-2.5 disabled:opacity-50 transform hover:scale-105 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
              ) : (
                <Save className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
              )}
              <span className="relative z-10">{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ─── Settings Tab ─── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-fade-in">

          {/* Notifications */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-5">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-400" />
              <h3 className="font-display font-bold text-lg text-white">Notifications</h3>
            </div>
            <div className="space-y-3">
              {[
                { key: 'tripReminders', label: 'Trip Date Reminders', desc: 'Get notified 7 days before your trip starts', icon: MapPin, color: 'text-brand-400' },
                { key: 'budgetAlerts', label: 'Budget Over-Limit Alerts', desc: 'Notified when daily spending exceeds your target', icon: AlertTriangle, color: 'text-amber-400' },
                { key: 'shareActivity', label: 'Share Activity Updates', desc: 'When someone copies your public itinerary', icon: Heart, color: 'text-pink-400' },
                { key: 'weeklyDigest', label: 'Weekly Travel Digest', desc: 'Curated destination recommendations every week', icon: Sparkles, color: 'text-purple-400' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/30 border border-slate-800/50 group hover:border-slate-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.key)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 shrink-0 overflow-hidden group ${
                      notifications[item.key] 
                        ? 'bg-gradient-to-r from-brand-500 to-brand-400 shadow-lg shadow-brand-500/40' 
                        : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                      notifications[item.key] ? 'translate-x-8' : 'translate-x-1'
                    }`}>
                      {notifications[item.key] && <CheckCircle2 className="w-3 h-3 text-brand-500" />}
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Security Tab ─── */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">

          {/* Security Overview */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Security Status</h3>
                <p className="text-xs text-emerald-400 font-semibold">Account secured</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Email Verified', status: true, icon: Mail },
                { label: 'Password Set', status: true, icon: Lock },
                { label: '2FA Enabled', status: false, icon: ShieldCheck },
              ].map(item => (
                <div key={item.label} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
                  item.status ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800/50'
                }`}>
                  <item.icon className={`w-4 h-4 ${item.status ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className={`text-xs font-semibold ${item.status ? 'text-emerald-300' : 'text-slate-500'}`}>{item.label}</span>
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    item.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>{item.status ? 'ON' : 'OFF'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <form onSubmit={handlePasswordChange} className="glass-card rounded-3xl p-6 border border-slate-800/50 space-y-5">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-400" />
              <h3 className="font-display font-bold text-lg text-white">Change Password</h3>
            </div>

            {/* 1. Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2. New Password (FIRST PASSWORD FIELD) with attached Strength Meter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator - attached directly under New Password */}
              {newPassword.length > 0 && (
                <div className="bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="text-white font-bold flex items-center gap-1">
                      {newPassword.length < 5 ? '🔴 Weak' : newPassword.length < 8 ? '🟡 Moderate' : newPassword.length < 11 ? '🟢 Strong' : '✨ Excellent'}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex gap-1.5 h-1.5">
                    <div className={`flex-1 rounded-full transition-all duration-300 ${newPassword.length >= 1 ? (newPassword.length < 5 ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                    <div className={`flex-1 rounded-full transition-all duration-300 ${newPassword.length >= 5 ? (newPassword.length < 8 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                    <div className={`flex-1 rounded-full transition-all duration-300 ${newPassword.length >= 8 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    <div className={`flex-1 rounded-full transition-all duration-300 ${newPassword.length >= 11 ? 'bg-cyan-400' : 'bg-slate-800'}`} />
                  </div>

                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 pt-1">
                    <span className={`flex items-center gap-1 ${newPassword.length >= 8 ? 'text-emerald-400 font-semibold' : ''}`}>
                      {newPassword.length >= 8 ? '✓' : '○'} 8+ characters
                    </span>
                    <span className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}`}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'} Has number
                    </span>
                    <span className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}`}>
                      {/[A-Z]/.test(newPassword) ? '✓' : '○'} Has uppercase
                    </span>
                    <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-400 font-semibold' : ''}`}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '○'} Has symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  required
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Match Status */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] font-semibold flex items-center gap-1.5 pt-0.5">
                  {confirmPassword === newPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  ) }
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={pwLoading}
                className="group relative px-7 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-300 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 disabled:opacity-50 transform hover:scale-105 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {pwLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" /> : <Lock className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />}
                <span className="relative z-10">{pwLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Danger Zone Tab ─── */}
      {activeTab === 'danger' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-500/8 border border-rose-500/20 text-sm text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <p>Actions in this section are <strong>irreversible</strong>. Please proceed with caution.</p>
          </div>

          {/* Sign out all devices */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                <LogOut className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Sign Out Everywhere</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Terminate all active sessions across all devices and browsers.</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); toast.success('Signed out from all sessions.'); }}
              className="group relative shrink-0 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white font-bold text-xs rounded-xl border border-amber-500/30 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                <LogOut className="w-3.5 h-3.5" />
                Sign Out All
              </span>
            </button>
          </div>

          {/* Delete Account */}
          <div className="glass-card rounded-3xl p-6 border border-rose-500/20 bg-rose-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h4 className="font-semibold text-rose-300 text-sm">Delete My Account Permanently</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Deletes your account, all trips, itineraries, activities, and data. This cannot be undone.</p>
              </div>
            </div>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="group relative shrink-0 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl border border-rose-500/30 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account?"
        message="This action will delete your account, all associated trips, stops, activities, and shared links permanently and cannot be undone."
        confirmText="Yes, Delete My Account"
      />
    </div>
  );
};
