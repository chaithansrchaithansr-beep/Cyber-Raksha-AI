import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NationalAnalytics } from '../types';
import { StatCard } from '../components/StatCard';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  BarChart3, ShieldAlert, Users, Bell, Download, Filter,
  Activity, ArrowUpRight, CheckCircle2, TrendingUp
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

export const AnalyticsDashboardPage: React.FC = () => {
  const [data, setData] = useState<NationalAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.analytics.getNationalAnalytics();
        setData(res);
      } catch (e) {
        console.error('Failed to load national analytics', e);
      }
    };
    loadAnalytics();
  }, []);

  const COLORS = ['#00E5FF', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ["Date", "Total Scans", "Phishing", "Scam Messages", "UPI Frauds"],
      ...data.threat_trends.map(t => [t.date, t.total_scans, t.phishing, t.scam_messages, t.upi_frauds])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cyber_Raksha_National_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Module 11 • National Cyber Threat Intelligence</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">National Threat Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Aggregated intelligence metrics across citizens, financial institutions, and government infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Scans"
          value={data?.total_scans.toLocaleString() || "18,420"}
          icon={Activity}
          change="+14.2% today"
          color="cyan"
        />
        <StatCard
          title="High Risk"
          value={data?.high_risk_threats.toLocaleString() || "6,480"}
          icon={ShieldAlert}
          change="+8.4% today"
          color="red"
        />
        <StatCard
          title="Active Clusters"
          value={data?.verified_campaigns || "24"}
          icon={BarChart3}
          color="amber"
        />
        <StatCard
          title="Active Alerts"
          value={data?.active_alerts || "4"}
          icon={Bell}
          color="blue"
        />
        <StatCard
          title="Users Protected"
          value={data?.citizens_protected.toLocaleString() || "94,250"}
          icon={Users}
          change="+1,200 this week"
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Lines Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Daily Threat Detection Trends (Multi-Vector)
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">Live Telemetry Feed</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.threat_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="phishing" stroke="#00E5FF" strokeWidth={2} name="Phishing URLs" dot={false} />
                <Line type="monotone" dataKey="scam_messages" stroke="#3B82F6" strokeWidth={2} name="Scam Messages" dot={false} />
                <Line type="monotone" dataKey="upi_frauds" stroke="#EF4444" strokeWidth={2} name="UPI Frauds" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Threat Vectors Distribution
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_distribution || []}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {(data?.category_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {(data?.category_distribution || []).slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="truncate max-w-[140px]">{c.category}</span>
                </span>
                <span className="font-bold text-white">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
