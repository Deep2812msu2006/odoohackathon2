import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const EmptyState = ({
  title = "No trips found",
  description = "You haven't created any trips yet. Start planning your first adventure now!",
  actionText = "Plan New Trip",
  actionLink = "/trips/new",
  icon: Icon = Compass,
}) => {
  return (
    <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12 space-y-5 border border-slate-800">
      <div className="w-16 h-16 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center mx-auto border border-brand-500/20">
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
      </div>
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm rounded-xl shadow-glow transition-all transform hover:-translate-y-0.5"
        >
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
};
