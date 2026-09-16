import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { api } from '../services/api';
import { ScanResult, CitizenDashboardData } from '../types';
import { StatCard } from '../components/StatCard';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  ShieldCheck, AlertTriangle, Link2, MessageSquare, Camera, QrCode,
  FileText, History, ArrowRight, Download, PhoneCall, Plus, ShieldAlert,
  Cpu, Bell, Activity
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<CitizenDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await api.citizen.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load citizen dashboard stats', e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const safetyScore = stats?.safety_score ?? stats?.cyber_safety_score ?? 88;
  const score = Math.max(0, Math.min(100, 100 - safetyScore));
  const statusLabel = stats?.safety_status ?? stats?.risk_label ?? (safetyScore >= 80 ? "WELL DEFENDED" : "MODERATE EXPOSURE");
  const reportsCount = stats?.total_reports ?? stats?.reported_incidents ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner with National Security Status */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            NATIONAL CITIZEN DEFENSE NODE ACTIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Protecting your personal devices, WhatsApp chats, banking SMS, and UPI transactions from emerging digital threats.
          </p>
        </div>

        {/* Dynamic Cyber Safety Score Gauge */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-4 shrink-0">
          <RiskGauge score={score} size={110} showLabel={false} />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Personal Safety Score</span>
            <p className="text-sm font-black text-emerald-400 mt-0.5">
              {safetyScore}/100 • {statusLabel}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Zero Trust Validation: Active</p>
          </div>
        </div>
      </div>

      {/* Dynamic Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Scans"
          value={stats ? String(stats.total_scans) : "0"}
          subtitle="Audited targets"
          icon={Activity}
          trend={stats && stats.total_scans > 0 ? "Active Defense" : "Ready"}
          trendPositive={true}
        />
        <StatCard
          title="Threats Caught"
          value={stats ? String(stats.high_risk_scans) : "0"}
          subtitle="High/Critical risks"
          icon={AlertTriangle}
          trend={stats && stats.high_risk_scans > 0 ? "Neutralized" : "Zero active"}
          trendPositive={false}
        />
        <StatCard
          title="My Reports Filed"
          value={stats ? String(reportsCount) : "0"}
          subtitle="Contributed to network"
          icon={FileText}
          trend="Citizen Radar"
          trendPositive={true}
        />
        <StatCard
          title="National Radar"
          value="OPERATIONAL"
          subtitle="AI Detection Engine"
          icon={ShieldAlert}
          trend="CERT-In Aligned"
          trendPositive={true}
        />
      </div>

      {/* Quick Threat Scanner Action Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Core Threat Scanners</span>
            <span className="h-px w-24 bg-slate-800"></span>
          </h2>

          <Link
            to="/citizen/report-scam"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report a Scam</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/scan/url"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Link2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-cyan-400">Scan URL</span>
          </Link>

          <Link
            to="/scan/message"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-blue-400">SMS / WhatsApp</span>
          </Link>

          <Link
            to="/scan/screenshot"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-purple-400">Receipt OCR</span>
          </Link>

          <Link
            to="/scan/qr"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-amber-400">QR Security</span>
          </Link>

          <Link
            to="/scan/email"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-emerald-400">Email Phish</span>
          </Link>

          <Link
            to="/scan/website"
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all group text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
          >
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white group-hover:text-rose-400">Fake Website</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Scans + Emergency Helpline Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scans Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              Recent Personal Threat Scans
            </h3>
            <Link to="/history" className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold">
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(!stats?.recent_scans || stats.recent_scans.length === 0) ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-slate-400">No scans recorded for your account yet.</p>
                <p className="text-[11px] text-slate-500">Test any URL, message, or QR code to audit threats in real time.</p>
              </div>
            ) : (
              stats.recent_scans.map((scan: ScanResult) => (
                <div key={scan.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                        {scan.scan_type}
                      </span>
                      <ThreatBadge level={scan.classification} />
                      {scan.analysis_method && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                          {scan.analysis_method.includes("Model") ? "🤖 AI Model" : "🛡 Heuristic Rule"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate mt-1.5">{scan.input_preview}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Risk Score: <strong className="text-white">{scan.risk_score}/100</strong> • 
                      Confidence: {scan.confidence}% • {new Date(scan.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <a
                    href={api.scans.getPdfDownloadUrl(scan.id)}
                    download
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0"
                    title="Download Official Incident Report (PDF)"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Assistance & Cyber Safety Hotline Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-red-500/30 bg-red-500/5 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <h4 className="text-sm font-extrabold uppercase tracking-wider">Victim of Fraud? Act Fast!</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If money has been deducted or you shared your OTP/PIN, report within the <strong>Golden Hour</strong> to freeze the transaction:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-red-500/30 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">National Cyber Financial Helpline</span>
              <a href="tel:1930" className="text-2xl font-black text-red-400 tracking-wider hover:underline">
                DIAL 1930
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">Toll-Free (Ministry of Home Affairs)</span>
            </div>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-center block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              cybercrime.gov.in
            </a>
          </div>

          {/* Quick Awareness Widget */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Golden Safety Rule</h4>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
              💡 <strong>Remember:</strong> Receiving funds via UPI NEVER requires entering your UPI PIN or scanning a QR code. A PIN is strictly for debiting money.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
