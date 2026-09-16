import React from 'react';
import { useAlerts } from '../store/AlertContext';
import { Bell, X, AlertTriangle, ExternalLink } from 'lucide-react';

export const LiveAlertToast: React.FC = () => {
  const { liveNotification, dismissLiveNotification } = useAlerts();

  if (!liveNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div className="glass-panel bg-slate-900/95 border-2 border-red-500/80 rounded-xl p-4 shadow-[0_10px_40px_rgba(239,68,68,0.3)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400 shrink-0 animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-500 text-black px-2 py-0.5 rounded">
                LIVE THREAT ADVISORY
              </span>
              <span className="text-xs text-slate-400 font-mono">Just Now</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{liveNotification.title}</h4>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">{liveNotification.message}</p>
          </div>
          <button
            onClick={dismissLiveNotification}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
