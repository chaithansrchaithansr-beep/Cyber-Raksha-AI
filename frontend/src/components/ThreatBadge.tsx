import React from 'react';

interface ThreatBadgeProps {
  level: string;
  className?: string;
}

export const ThreatBadge: React.FC<ThreatBadgeProps> = ({ level, className = '' }) => {
  const norm = level.toUpperCase();
  if (norm.includes('CRITICAL')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
        CRITICAL RISK
      </span>
    );
  }
  if (norm.includes('HIGH')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        HIGH RISK
      </span>
    );
  }
  if (norm.includes('MODERATE')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-300"></span>
        MODERATE RISK
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
      LOW RISK
    </span>
  );
};
