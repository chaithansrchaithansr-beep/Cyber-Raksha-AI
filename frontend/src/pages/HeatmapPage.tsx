import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { HeatmapState } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { MapPin, Filter, ShieldAlert, ArrowUpRight, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export const HeatmapPage: React.FC = () => {
  const [states, setStates] = useState<HeatmapState[]>([]);
  const [selectedState, setSelectedState] = useState<HeatmapState | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHeatmap = async () => {
      try {
        const data = await api.analytics.getHeatmap();
        setStates(data);
        if (data.length > 0) setSelectedState(data[0]);
      } catch (e) {
        console.error('Failed to load heatmap', e);
      } finally {
        setLoading(false);
      }
    };
    loadHeatmap();
  }, []);

  const filteredStates = states.filter((s) => {
    if (filterCategory === 'All') return true;
    return s.top_threat_category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Module 10 • Privacy-Preserving Regional Aggregation</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">India Cyber Threat Heatmap</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time geospatial visualization of cyber threat incidents across Indian states without disclosing individual victim locations.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Threat Vectors</option>
            <option value="KYC">KYC & Banking Scams</option>
            <option value="UPI">UPI & QR Frauds</option>
            <option value="Job">Fake Part-Time Jobs</option>
            <option value="Electricity">Electricity Disconnection</option>
            <option value="Phishing">Phishing URLs</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map Grid + Regional Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* States Cards Grid */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase text-slate-400">
              State Telemetry Feeds ({filteredStates.length} Regions Monitored)
            </span>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Moderate</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredStates.map((st) => {
              const isSelected = selectedState?.state_code === st.state_code;
              return (
                <button
                  key={st.state_code}
                  onClick={() => setSelectedState(st)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">{st.state_code}</span>
                    <ThreatBadge level={st.severity} className="text-[9px] py-0 px-1.5" />
                  </div>
                  <h4 className="text-xs font-black text-white mt-1.5 truncate">{st.state_name}</h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span>{st.report_count} Reports</span>
                    <span className="text-cyan-400 truncate max-w-[80px]">{st.top_threat_category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Regional Detail Breakdown */}
        {selectedState && (
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Selected Region</span>
                  <h3 className="text-2xl font-black text-white mt-0.5">{selectedState.state_name}</h3>
                </div>
                <ThreatBadge level={selectedState.severity} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Aggregated Reports</span>
                  <p className="text-2xl font-black text-white mt-0.5">{selectedState.report_count}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Trend Direction</span>
                  <p className="text-sm font-extrabold text-cyan-400 mt-1 capitalize flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {selectedState.trend}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">Dominant Scam Vector</span>
                <p className="text-sm font-extrabold text-amber-300">{selectedState.top_threat_category}</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Heightened activity recorded targeting mobile banking users and regional electricity consumer databases.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                🔒 <strong>Privacy Assurance:</strong> GPS coordinates, victim names, and phone numbers are strictly stripped at source. Telemetry is aggregated at the state boundary level.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">State Law Enforcement Escalation</span>
              <p className="text-xs font-bold text-white mt-1">State Cyber Cell Dispatched</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Escalation Ref: IND-ST-{selectedState.state_code}-2026</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
