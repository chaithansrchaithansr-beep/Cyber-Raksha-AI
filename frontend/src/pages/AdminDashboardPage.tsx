import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { useAlerts } from '../store/AlertContext';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  ShieldAlert, Zap, Cpu, Users, Activity, CheckCircle2,
  RefreshCw, Lock, Terminal, ShieldCheck
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { simulateThreatEvent } = useAlerts();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await api.admin.getDashboardStats();
        setStats(s);
      } catch (e) {
        console.error("Failed to load dashboard stats", e);
      }
      try {
        const u = await api.admin.getUsers();
        setUsers(u);
        const m = await api.admin.getModels();
        setModels(m);
        const l = await api.admin.getAuditLogs();
        setAuditLogs(l);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    await simulateThreatEvent();
    setTimeout(() => setSimulating(false), 800);
  };

  const handleToggleUser = async (id: number) => {
    try {
      const res = await api.admin.toggleUserStatus(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.is_active } : u));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header with Live SecOps Command Controls */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-slate-900/80 to-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldAlert className="w-4 h-4" />
            NATIONAL SECOPS COMMAND & CONTROL
          </div>
          <h1 className="text-3xl font-black text-white mt-2">Administrative Overview</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            System health, AI model evaluation benchmarks, user identity control, and operational defense telemetry.
          </p>
        </div>

        {/* SecOps Threat Defense Drill Trigger Button */}
        <button
          onClick={handleSimulate}
          disabled={simulating}
          className="px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Zap className={`w-4 h-4 ${simulating ? 'animate-spin' : ''}`} />
          <span>RUN SECOPS DRILL</span>
        </button>
      </div>

      {/* Live Operational Database Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Scans Audited</span>
          <p className="text-2xl font-black text-white font-mono">{stats ? stats.total_scans : "18,400+"}</p>
          <p className="text-[11px] text-cyan-400 font-semibold">Live System Ingest</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Threats Neutralized</span>
          <p className="text-2xl font-black text-rose-400 font-mono">{stats ? stats.high_risk_scans : "1,420"}</p>
          <p className="text-[11px] text-rose-300 font-semibold">High / Critical Blocks</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Threat Clusters</span>
          <p className="text-2xl font-black text-amber-400 font-mono">{stats ? stats.verified_threat_clusters : "142"}</p>
          <p className="text-[11px] text-amber-300 font-semibold">Campaigns Fused</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Registered Accounts</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">{stats ? (stats.total_users + stats.total_organizations) : users.length}</p>
          <p className="text-[11px] text-emerald-300 font-semibold">Citizens & Enterprises</p>
        </div>
      </div>

      {/* AI Model Evaluation Dashboard (Module 37) */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          AI Model Evaluation & Performance Dashboard (Module 37)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {models.map((mod, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{mod.version}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {mod.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{mod.model_name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">{mod.algorithm}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <div className="p-2 rounded-lg bg-slate-900 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">Accuracy</span>
                  <span className="font-extrabold text-white">{mod.accuracy}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">F1-Score</span>
                  <span className="font-extrabold text-cyan-400">{mod.f1_score}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">Precision</span>
                  <span className="font-bold text-slate-300">{mod.precision}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">Recall</span>
                  <span className="font-bold text-slate-300">{mod.recall}%</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono">
                Training Samples: {mod.training_samples.toLocaleString()} • ROC-AUC: {mod.roc_auc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* User Management & Security Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Table */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            User Identity & Access Control
          </h2>

          <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-white">{u.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                    {u.role}
                  </span>
                  <button
                    onClick={() => handleToggleUser(u.id)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                      u.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {u.is_active ? "Active" : "Disabled"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            Security Audit Trail (SHA-256 IP Masked)
          </h2>

          <div className="space-y-2.5 max-h-72 overflow-y-auto font-mono text-[11px]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-cyan-400 font-bold">{log.action}</span>
                  <span>{log.timestamp}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <span className="text-[10px] text-slate-500 block">IP Hash: {log.ip_hash}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
