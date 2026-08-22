import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 max-w-md w-full border border-slate-800 space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">{title}</h3>
            <p className="text-xs text-slate-400">Please confirm your action.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
