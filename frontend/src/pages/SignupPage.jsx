import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup({ name, email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (password.length < 5) return { label: 'Weak', color: 'text-rose-400', icon: '🔴' };
    if (password.length < 8) return { label: 'Moderate', color: 'text-amber-400', icon: '🟡' };
    if (password.length < 11) return { label: 'Strong', color: 'text-emerald-400', icon: '🟢' };
    return { label: 'Excellent', color: 'text-cyan-400', icon: '✨' };
  };

  const strength = getStrengthLabel();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-display font-bold text-2xl text-white">Create Account</h2>
        <p className="text-sm text-slate-400">Join GlobeTrotter to plan collaborative travel</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-sm focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator Box */}
          {password.length > 0 && (
            <div className="mt-2.5 bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-2.5 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Password Strength:</span>
                <span className={`${strength.color} flex items-center gap-1`}>
                  <span>{strength.icon}</span>
                  <span>{strength.label}</span>
                </span>
              </div>
              
              {/* 4 Segmented Progress Bar */}
              <div className="flex gap-1.5 h-1.5">
                <div className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 1 ? (password.length < 5 ? 'bg-rose-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                <div className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 5 ? (password.length < 8 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                <div className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                <div className={`flex-1 rounded-full transition-all duration-300 ${password.length >= 11 ? 'bg-cyan-400' : 'bg-slate-800'}`} />
              </div>

              {/* Requirements Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <span className={`flex items-center gap-1.5 transition-colors ${password.length >= 8 ? 'text-emerald-400 font-bold' : ''}`}>
                  <span>{password.length >= 8 ? '✓' : '○'}</span>
                  <span>8+ characters</span>
                </span>
                <span className={`flex items-center gap-1.5 transition-colors ${/[0-9]/.test(password) ? 'text-emerald-400 font-bold' : ''}`}>
                  <span>{/[0-9]/.test(password) ? '✓' : '○'}</span>
                  <span>Has number</span>
                </span>
                <span className={`flex items-center gap-1.5 transition-colors ${/[A-Z]/.test(password) ? 'text-emerald-400 font-bold' : ''}`}>
                  <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                  <span>Has uppercase</span>
                </span>
                <span className={`flex items-center gap-1.5 transition-colors ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400 font-bold' : ''}`}>
                  <span>{/[^A-Za-z0-9]/.test(password) ? '✓' : '○'}</span>
                  <span>Has symbol</span>
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
