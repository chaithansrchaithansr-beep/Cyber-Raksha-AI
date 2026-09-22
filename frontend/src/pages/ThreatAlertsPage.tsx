import React, { useState } from 'react';
import { useAlerts } from '../store/AlertContext';
import { ThreatBadge } from '../components/ThreatBadge';
import { Bell, Radio, AlertTriangle, Zap, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export const ThreatAlertsPage: React.FC = () => {
  const { alerts, simulateThreatEvent } = useAlerts();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = async () => {
    setSimulating(true);
    await simulateThreatEvent();
    setTimeout(() => setSimulating(false), 800);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header with Live Status and SecOps Drill Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Module 07 • WebSocket Real-Time Broadcast Radar</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Real-Time Threat Alerts</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Instant national security alerts broadcasted over WebSockets without requiring a page refresh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>WebSocket Live</span>
          </div>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
            <span>Run SecOps Drill</span>
          </button>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'critical', 'high', 'medium'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
              filterSeverity === sev
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {sev === 'all' ? 'All Active Alerts' : `${sev} Severity`}
          </button>
        ))}
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
            No active threat alerts in this category. All perimeter nodes normal.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass-panel p-6 rounded-3xl border transition-all ${
                alert.severity === 'critical'
                  ? 'border-red-500/40 bg-red-500/5 hover:border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl mt-0.5 ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{alert.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                      <span>•</span>
                      <span className="uppercase">Category: {alert.category}</span>
                    </div>
                  </div>
                </div>

                <ThreatBadge level={alert.severity} className="shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
