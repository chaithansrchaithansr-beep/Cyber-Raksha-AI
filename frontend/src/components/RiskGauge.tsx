import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  showLabel?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 180, showLabel = true }) => {
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius; // semi-circle
  const safeScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let color = '#10B981'; // green
  let classification = 'LOW RISK';
  if (safeScore > 25) {
    color = '#F59E0B'; // amber/yellow
    classification = 'MODERATE RISK';
  }
  if (safeScore > 50) {
    color = '#F97316'; // orange
    classification = 'HIGH RISK';
  }
  if (safeScore > 75) {
    color = '#EF4444'; // red
    classification = 'CRITICAL RISK';
  }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size * 0.65} className="overflow-visible">
        {/* Background Arc */}
        <path
          d={`M 12,${size * 0.55} A ${radius},${radius} 0 0,1 ${size - 12},${size * 0.55}`}
          fill="none"
          stroke="#1E293B"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Progress Arc */}
        <path
          d={`M 12,${size * 0.55} A ${radius},${radius} 0 0,1 ${size - 12},${size * 0.55}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2 text-center">
        <span className="text-3xl font-extrabold text-white tracking-tight">{Math.round(safeScore)}</span>
        <span className="text-xs text-slate-400 block font-mono">/100</span>
      </div>
      {showLabel && (
        <div className="mt-2 text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
             style={{ borderColor: `${color}66`, color: color, backgroundColor: `${color}15` }}>
          {classification}
        </div>
      )}
    </div>
  );
};
