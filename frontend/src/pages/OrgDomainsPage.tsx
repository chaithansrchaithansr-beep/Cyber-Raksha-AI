import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OrgDomainItem } from '../types';
import { 
  Globe, ShieldCheck, Plus, CheckCircle2, AlertTriangle, 
  Trash2, RefreshCw, Key, ExternalLink, ShieldAlert
} from 'lucide-react';

export const OrgDomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<OrgDomainItem[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDomains = async () => {
    try {
      const data = await api.org.getDomains();
      setDomains(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.org.registerDomain(newDomain.trim());
      setSuccess(`Domain ${newDomain.trim()} registered for brand protection.`);
      setNewDomain('');
      await loadDomains();
    } catch (err: any) {
      setError(err.message || 'Failed to register domain.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (id: number, domainName: string) => {
    try {
      await api.org.verifyDomain(id);
      setSuccess(`Domain ${domainName} verified successfully.`);
      await loadDomains();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Globe className="w-4 h-4" />
          <span>Brand Defense • Authorized Domain Management</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Authorized Domains & Impersonation Watch</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Register and verify your organizational domains to enable active lookalike monitoring, typosquatting alerts, and authorized scanner accreditation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Add Domain Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" />
          Register New Domain
        </h2>
        <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="e.g. portal.company.co.in or internal.bank.com"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            type="submit"
            disabled={submitting || !newDomain.trim()}
            className="px-6 py-3 rounded-xl text-xs font-bold uppercase bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50 shrink-0"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Domain</span>
              </>
            )}
          </button>
        </form>
        <p className="text-[11px] text-slate-500">
          Domains added will undergo automated DNS TXT token challenge verification or immediate administrative attestation.
        </p>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Registered Identities ({domains.length})
        </h2>

        {loading ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-xs font-mono text-cyan-400">
            LOADING REGISTERED DOMAINS...
          </div>
        ) : domains.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No domains registered yet.</p>
            <p className="text-[11px] text-slate-500">Add your primary brand domain above to activate the lookalike radar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {domains.map((dom) => (
              <div
                key={dom.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-white">{dom.domain}</span>
                    {dom.is_verified ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>Token: {dom.verification_token}</span>
                    <span>Added: {new Date(dom.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!dom.is_verified && (
                    <button
                      onClick={() => handleVerify(dom.id, dom.domain)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Now</span>
                    </button>
                  )}
                  <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                    Radar Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
