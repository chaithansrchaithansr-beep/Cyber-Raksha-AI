import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { Globe2, ShieldAlert, ArrowRight, Download, CheckCircle2, AlertTriangle, RefreshCw, Eye } from 'lucide-react';

export const WebsiteAnalyzerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [targetBrand, setTargetBrand] = useState('State Bank of India');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleTargets = [
    { label: "🚨 Fake SBI YONO Portal", url: "http://sbi-rewards-yono.xyz/login.php", brand: "State Bank of India" },
    { label: "🚨 Fake Income Tax Refund Site", url: "http://incometax-refund-gov.work", brand: "Income Tax Department" },
    { label: "🚨 Fake Paytm KYC Update", url: "http://paytm-wallet-kyc.top", brand: "Paytm Payments Bank" }
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanWebsite({ url, simulated_brand: targetBrand });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Globe2 className="w-4 h-4" />
          <span>Module 04 • Visual DOM & Brand Impersonation Engine</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Fake Website Detection</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Inspects web page DOM structure, visual brand similarity, credential harvesting forms, and unauthorized mirror sites.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Website URL</label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://sbi-rewards-yono.xyz/login.php"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Suspected Target Brand</label>
              <select
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="Income Tax Department">Income Tax Department</option>
                <option value="Paytm Payments Bank">Paytm Payments Bank</option>
                <option value="India Post">India Post</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditing Website...</span>
                </>
              ) : (
                <>
                  <span>Analyze Website</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase text-slate-400">Target Samples:</span>
          {sampleTargets.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setUrl(s.url); setTargetBrand(s.brand); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all font-mono"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Website Security Audit</span>
              <h3 className="text-xl font-black text-white mt-1 break-all font-mono">{result.input_preview}</h3>
            </div>
            <ThreatBadge level={result.classification} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <RiskGauge score={result.risk_score} size={160} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Brand Impersonation</span>
                  <p className="text-sm font-extrabold text-red-400 mt-0.5">DETECTED ({targetBrand})</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Visual Similarity</span>
                  <p className="text-sm font-extrabold text-amber-400 mt-0.5">84% Match</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">AI Threat Evaluation</span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Audit Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.detected_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <span className="text-red-400 font-bold">⚠</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Safety Recommendation</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-amber-100 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <a
              href={api.scans.getPdfDownloadUrl(result.id)}
              download
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Audit Report (PDF)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
