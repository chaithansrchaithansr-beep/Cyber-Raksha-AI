import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  color?: 'cyan' | 'red' | 'amber' | 'emerald' | 'blue';
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  color = 'cyan',
  subtitle,
  trend,
  trendPositive = true
}) => {
  const colorMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40'
  };

  const displayTrend = trend || change;
  const isTrendPositive = trend !== undefined ? trendPositive : isPositive;

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl lg:text-3xl font-black text-white mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
          {displayTrend && (
            <p className={`text-xs mt-1.5 flex items-center gap-1 font-medium ${isTrendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <span>{isTrendPositive ? '↑' : '↓'}</span>
              <span>{displayTrend}</span>
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl border transition-all duration-300 ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};
