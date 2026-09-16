import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { api } from '../services/api';
import { OrgDashboardData } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskGauge } from '../components/RiskGauge';
import { 
  Building2, Globe, ShieldCheck, Key, Copy, Check, 
  AlertTriangle, ArrowRight, Plus, Users, ShieldAlert,
  Activity, FileText, CheckCircle2, Lock
} from 'lucide-react';

export const OrgDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OrgDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrgStats = async () => {
      try {
        const data = await api.org.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load organization stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadOrgStats();
  }, []);

  const copyKey = () => {
    if (stats?.api_key) {
      navigator.clipboard.writeText(stats.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Org Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Building2 className="w-4 h-4" />
            <span>ENTERPRISE SECURITY OPERATIONS HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
            {stats?.org_name || user?.organization || "Enterprise Security Alliance"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Organization Type: <strong className="text-white uppercase">{stats?.org_type || "Commercial Enterprise"}</strong> • 
            Verification: {stats?.verified ? (
              <span className="text-emerald-400 font-bold ml-1">VERIFIED ENTITY</span>
            ) : (
              <span className="text-amber-400 font-bold ml-1">PENDING VERIFICATION</span>
            )}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 shrink-0">
          <RiskGauge score={stats?.risk_score ?? 28} size={100} showLabel={false} />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Posture Risk</span>
            <span className="text-sm font-black text-cyan-400">
              {stats?.risk_score ?? 28} / 100
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              RADAR ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Domains"
          value={stats ? String(stats.monitored_domains ?? stats.domains_count ?? 1) : "1"}
          subtitle="Authorized identities"
          icon={Globe}
          trend="Brand Defense"
          trendPositive={true}
        />
        <StatCard
          title="Open Incidents"
          value={stats ? String(stats.open_incidents) : "0"}
          subtitle="Active investigations"
          icon={AlertTriangle}
          trend={(stats?.open_incidents ?? 0) > 0 ? "Action Required" : "All Clear"}
          trendPositive={!((stats?.open_incidents ?? 0) > 0)}
        />
        <StatCard
          title="SecOps Team"
          value={stats ? String(stats.team_count ?? stats.team_size ?? 1) : "1"}
          subtitle="Authorized responders"
          icon={Users}
          trend="Role RBAC"
          trendPositive={true}
        />
        <StatCard
          title="Active Telemetry"
          value={stats ? String(stats.active_monitors) : "24"}
          subtitle="Live feeds monitored"
          icon={Activity}
          trend="Real-Time"
          trendPositive={true}
        />
      </div>

      {/* Quick Ops Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/organization/domains"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-400">Authorized Domains</h3>
            <p className="text-xs text-slate-400">Manage organizational domains, DNS validation tokens, and brand impersonation alerts.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-cyan-400">
            <span>Manage Domains</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/organization/incidents"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-400">Incident Management</h3>
            <p className="text-xs text-slate-400">Track triage states, assign incident response teams, and export CERT-In documentation.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-400">
            <span>View Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/organization/team"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-purple-400">SecOps Team</h3>
            <p className="text-xs text-slate-400">Provision analysts, configure access privileges, and monitor operational activity.</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-400">
            <span>Manage Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Brand Impersonation Watch */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Brand Impersonation & Typosquatting Watch (Module 21)
            </h2>
            <p className="text-xs text-slate-400">Automated lookalike domain detection and typosquatting monitoring targeting your brand.</p>
          </div>

          <Link
            to="/organization/domains"
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Configure Monitored Domains</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 pt-2">
          {(!stats?.brand_alerts || stats.brand_alerts.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">No lookalike domain threats detected currently.</p>
          ) : (
            stats.brand_alerts.map((alert: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400">{alert.domain}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {alert.similarity}% Match
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                      {alert.risk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">First seen: {alert.firstSeen || "Active detection"} • Passive signature match</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                    {alert.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Key Management */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Threat Intelligence SIEM API Key
          </h2>
          <p className="text-xs text-slate-400">Integrate CYBER RAKSHA AI detection endpoints into enterprise mail filters, firewalls, and perimeter SIEM.</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Enterprise Production Key</span>
            <span className="font-mono text-xs text-cyan-300 truncate block mt-0.5">
              {stats?.api_key || "cr_live_sec_org_default_key"}
            </span>
          </div>
          <button
            onClick={copyKey}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Copy Key"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
