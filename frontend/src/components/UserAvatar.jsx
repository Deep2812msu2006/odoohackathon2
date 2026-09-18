import React from 'react';

export const getInitials = (nameStr) => {
  if (!nameStr) return 'GT';
  const clean = nameStr.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'GT';
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-500 shadow-indigo-500/20',
  'from-cyan-600 via-teal-500 to-emerald-400 shadow-cyan-500/20',
  'from-amber-500 via-orange-500 to-rose-500 shadow-amber-500/20',
  'from-blue-600 via-brand-500 to-cyan-400 shadow-brand-500/20',
  'from-purple-600 via-violet-500 to-indigo-400 shadow-purple-500/20',
  'from-rose-600 via-pink-500 to-amber-400 shadow-rose-500/20',
  'from-emerald-600 via-teal-600 to-cyan-500 shadow-emerald-500/20',
  'from-fuchsia-600 via-purple-600 to-blue-500 shadow-fuchsia-500/20',
];

const getGradientForName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

export const UserAvatar = ({ name = 'User', photoUrl, className = 'w-9 h-9 rounded-xl', textClassName = 'text-xs' }) => {
  const hasCustomPhoto = Boolean(
    photoUrl && 
    photoUrl.trim() !== '' && 
    !photoUrl.includes('images.unsplash.com/photo-1534528741775') &&
    !photoUrl.includes('53994a69daeb')
  );

  if (hasCustomPhoto) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${className} object-cover shrink-0 border border-slate-700`}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  }

  const initials = getInitials(name);
  const gradientClass = getGradientForName(name || 'User');

  return (
    <div
      className={`${className} bg-gradient-to-tr ${gradientClass} text-white font-black flex items-center justify-center shadow-lg shrink-0 border border-white/20 select-none tracking-tight ${textClassName}`}
      title={name}
    >
      {initials}
    </div>
  );
};

