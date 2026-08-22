import React from 'react';

export const getInitials = (nameStr) => {
  if (!nameStr) return 'GT';
  const parts = nameStr.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UserAvatar = ({ name = 'User', photoUrl, className = 'w-9 h-9 rounded-xl', textClassName = 'text-xs' }) => {
  const hasPhoto = Boolean(photoUrl && photoUrl.trim() !== '' && !photoUrl.includes('images.unsplash.com/photo-1534528741775'));

  if (hasPhoto) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${className} object-cover shrink-0`}
      />
    );
  }

  const initials = getInitials(name);

  return (
    <div className={`${className} bg-gradient-to-tr from-brand-600 via-purple-600 to-cyan-400 text-white font-black flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0 border border-white/20 select-none ${textClassName}`}>
      {initials}
    </div>
  );
};
