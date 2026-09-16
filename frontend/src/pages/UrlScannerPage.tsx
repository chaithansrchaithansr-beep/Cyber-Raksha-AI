import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  Link2, ShieldAlert, ArrowRight, Download, FileText, CheckCircle2,
  AlertTriangle, Copy, Check, ExternalLink, RefreshCw
} from 'lucide-react';

export const UrlScannerPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleUrls = [
    { label: "🚨 Phishing: Fake SBI YONO", val: "http://sbi-rewards-yono.xyz/login.php" },
    { label: "🚨 Scam: DISCOM Electricity Pay", val: "http://192.168.1.1/electricity-bill-pay.work" },
    { label: "✅ Legitimate: Official SBI", val: "https://onlinesbi.sbi" },
    { label: "✅ Legitimate: National Portal", val: "https://cybercrime.gov.in" }
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanUrl(url);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyHash = () => {
    if (!result?.report_integrity_hash) return;
    navigator.clipboard.writeText(result.report_integrity_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Link2 className="w-4 h-4" />
          <span>Module 01 • Machine Learning & Lexical Analysis</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">AI Phishing URL Detector</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Deep heuristic and machine learning inspection of domains, Shannon entropy, lookalike brand spoofing, and evasion techniques.
        </p>
      </div>

      {/* Input Box */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste suspicious website URL here (e.g. http://sbi-rewards-yono.xyz/login.php)..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase text-slate-500">Quick Test Samples:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setUrl(s.val); }}
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

      {/* Result Display */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Scan Assessment Result</span>
              <h3 className="text-xl font-black text-white mt-1 break-all font-mono">{result.input_preview}</h3>
            </div>
            <ThreatBadge level={result.classification} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <RiskGauge score={result.risk_score} size={160} />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Classification</span>
                  <p className="text-base font-extrabold text-white mt-0.5">{result.classification}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">AI Model Confidence</span>
                  <p className="text-base font-extrabold text-cyan-400 mt-0.5">{result.confidence}%</p>
                </div>
              </div>

              {/* Explainable AI Block */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Why This Was Flagged (Explainable AI)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

          {/* Indicators List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Threat Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.detected_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <span className="text-red-400 font-bold">⚠</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Recommendations */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Recommended Citizen Actions</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-amber-100 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrity Hash and Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono truncate">
              <span>SHA-256 Hash: {result.report_integrity_hash.slice(0, 16)}...</span>
              <button onClick={copyHash} className="text-slate-400 hover:text-white" title="Copy full cryptographic integrity hash">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={api.scans.getPdfDownloadUrl(result.id)}
                download
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download PDF Report</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
