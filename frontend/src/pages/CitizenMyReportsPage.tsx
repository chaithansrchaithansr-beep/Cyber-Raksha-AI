import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ThreatReport } from '../types';
import { 
  FileText, ShieldCheck, AlertTriangle, CheckCircle2, Clock, 
  HelpCircle, ThumbsUp, Plus, ArrowRight, ExternalLink
} from 'lucide-react';

export const CitizenMyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await api.citizen.getMyReports();
        setReports(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load your reports.');
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'verified':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Verified Threat
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Under Investigation
          </span>
        );
      case 'false_positive':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-800 text-slate-400 border border-slate-700">
            False Positive
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
            Resolved / Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Citizen Tracking Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">My Submitted Scam Reports</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time verification status of threats you reported to the National Defense network.
          </p>
        </div>

        <Link
          to="/citizen/report-scam"
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Scam</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center font-mono text-xs text-cyan-400">
          LOADING INCIDENT RECORDS...
        </div>
      ) : reports.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Scam Reports Submitted Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Whenever you encounter a suspicious phishing link, UPI debit trick, or scam call, submit a report to alert the network.
            </p>
          </div>
          <Link
            to="/citizen/report-scam"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-all"
          >
            <span>File Your First Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/20">
                    CR-REP-{String(r.id).padStart(5, '0')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>{getStatusBadge(r.status)}</div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{r.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{r.description}</p>
              </div>

              {/* Threat Indicators */}
              {r.indicators && r.indicators.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Reported Signatures:
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {r.indicators.map((ind, idx) => (
                      <span key={idx} className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-slate-800">
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SecOps Admin Review Notes if present */}
              {r.admin_notes && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">
                    SecOps Defense Notes:
                  </span>
                  <p>{r.admin_notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                <span>Threat Category: <strong className="text-white uppercase">{r.threat_type}</strong></span>
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{r.upvotes} Community Confirmations</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
