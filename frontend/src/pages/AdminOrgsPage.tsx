import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Building2, ShieldCheck, AlertTriangle, CheckCircle2, 
  XCircle, Globe, RefreshCw, ExternalLink, Activity
} from 'lucide-react';

export const AdminOrgsPage: React.FC = () => {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrgs = async () => {
    try {
      const data = await api.admin.getOrganizations();
      setOrgs(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgs();
  }, []);

  const handleVerify = async (orgId: number, orgName: string) => {
    try {
      await api.admin.verifyOrganization(orgId);
      setFeedback(`Organization ${orgName} verified successfully.`);
      await loadOrgs();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback('Failed to update verification status.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>National Enterprise Registry</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Enterprise Organization Verification</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Review corporate applicant legitimacy, verify authorized domain bindings, and activate enterprise brand radar.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Registered Entities ({orgs.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">Real-Time Registry</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-cyan-400">
            LOADING ENTITY RECORDS...
          </div>
        ) : orgs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No organizations registered in the system yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((o) => (
              <div
                key={o.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{o.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {o.type}
                    </span>
                    {o.is_verified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400">
                    Primary Domain: <strong className="text-cyan-300">{o.domain}</strong> • 
                    Risk Posture: <strong className="text-white">{o.risk_score}/100</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!o.is_verified ? (
                    <button
                      onClick={() => handleVerify(o.id, o.name)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      Active Defense Node
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
