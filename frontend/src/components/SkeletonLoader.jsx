import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
    <div className="h-48 bg-slate-800/80 rounded-xl w-full"></div>
    <div className="h-6 bg-slate-800/80 rounded w-3/4"></div>
    <div className="h-4 bg-slate-800/60 rounded w-1/2"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 bg-slate-800/60 rounded w-1/3"></div>
      <div className="h-8 bg-slate-800/80 rounded-lg w-20"></div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
