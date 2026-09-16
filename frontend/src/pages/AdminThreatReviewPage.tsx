import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatCluster, ThreatReport } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  CheckSquare, ShieldCheck, CheckCircle2, XCircle, Clock,
  AlertTriangle, RefreshCw, MessageSquare, ThumbsUp, Send
} from 'lucide-react';

export const AdminThreatReviewPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reports' | 'clusters'>('reports');
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [clusters, setClusters] = useState<ThreatCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adminNotesMap, setAdminNotesMap] = useState<Record<number, string>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, cls] = await Promise.all([
        api.admin.getThreatReports(),
        api.clusters.getClusters()
      ]);
      setReports(reps);
      setClusters(cls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    try {
      const notes = adminNotesMap[reportId] || undefined;
      await api.admin.updateThreatReportStatus(reportId, status, notes);
      setFeedback(`Report #${reportId} marked as ${status.toUpperCase()}. Audit log recorded.`);
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message || 'Status update failed.');
    }
  };

  const handleClusterAction = async (code: string, action: string) => {
    try {
      await api.clusters.takeAction(code, action);
      setFeedback(`Cluster ${code} marked as ${action.toUpperCase()} successfully.`);
      await loadData();
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback(e.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <CheckSquare className="w-4 h-4" />
          <span>SecOps Triage & Threat Verification</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Threat Review & Incident Verification</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Validate citizen-reported scam indicators, append SecOps defensive advisories, and confirm national threat campaign clusters.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-cyan-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Citizen Reports ({reports.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('clusters')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'clusters'
              ? 'bg-cyan-500 text-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Threat Clusters ({clusters.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-xs font-mono text-cyan-400">
          LOADING THREAT TRIAGE QUEUE...
        </div>
      ) : activeTab === 'reports' ? (
        /* Citizen Reports Queue */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-xs text-slate-400">
              No citizen threat reports pending review.
            </div>
          ) : (
            reports.map((r) => (
              <div key={r.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20">
                      CR-REP-{String(r.id).padStart(5, '0')}
                    </span>
                    <span className="text-xs font-bold text-white">{r.title}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    r.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    r.status === 'under_review' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                    r.status === 'false_positive' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {r.status || 'PENDING'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>

                {/* Threat Indicators */}
                {r.indicators && r.indicators.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Reported Signatures:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.indicators.map((ind, i) => (
                        <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                          {ind}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes Input */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400">
                    SecOps Defense Notes & Disposition Advice:
                  </label>
                  <input
                    type="text"
                    defaultValue={r.admin_notes || ''}
                    placeholder="Enter notes (e.g. Confirmed phishing campaign targeting electricity utility users; domain blacklisted)"
                    onChange={(e) => setAdminNotesMap(prev => ({ ...prev, [r.id]: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 text-xs">
                  <span className="font-mono text-[11px] text-slate-500">
                    Reporter ID: #{r.reporter_id || "Anonymous"} • State: {r.state || "National"} • Category: {r.threat_type}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateReportStatus(r.id, 'under_review')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 transition-colors"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(r.id, 'verified')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
                    >
                      Verify Threat
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(r.id, 'false_positive')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      False Positive
                    </button>
                    <button
                      onClick={() => handleUpdateReportStatus(r.id, 'closed')}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Threat Clusters Queue */
        <div className="space-y-4">
          {clusters.map((c) => (
            <div key={c.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {c.cluster_code}
                  </span>
                  <h3 className="text-base font-bold text-white">{c.campaign_title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    c.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300' :
                    c.status === 'resolved' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    Status: {c.status}
                  </span>
                  <ThreatBadge level={c.severity} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Report Volume</span>
                  <span className="text-lg font-black text-white">{c.report_count} Correlated Reports</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Clustering Confidence</span>
                  <span className="text-lg font-black text-cyan-400">{c.confidence}%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Affected States</span>
                  <span className="text-xs font-bold text-slate-300 truncate block mt-1">
                    {(c.affected_states || []).join(', ') || "National Scale"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-500">Shared Malicious Signatures:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(c.common_indicators || []).map((ind, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[11px]">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Admin Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleClusterAction(c.cluster_code, 'verify')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Campaign</span>
                </button>

                <button
                  onClick={() => handleClusterAction(c.cluster_code, 'resolve')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>

                <button
                  onClick={() => handleClusterAction(c.cluster_code, 'reject')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark False Positive</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
