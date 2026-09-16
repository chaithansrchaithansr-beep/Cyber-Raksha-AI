import React, { useState } from 'react';
import { api } from '../services/api';
import { FusionResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  Network, Zap, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle,
  RefreshCw, Link2, MessageSquare, Camera, Check, ShieldCheck
} from 'lucide-react';

export const ThreatFusionPage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [screenshotText, setScreenshotText] = useState('');
  const [brand, setBrand] = useState('State Bank of India');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FusionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPresetCampaign = () => {
    setUrl("http://sbi-rewards-yono.xyz/login.php");
    setMessage("Dear SBI Customer, your YONO account is suspended! Update your PAN card immediately to avoid permanent blockage: http://sbi-rewards-yono.xyz");
    setScreenshotText("Payment Successful to SBI Merchant. Amount: Rs 15,000. UPI Ref ID: 324590128491. Paid via Google Pay.");
    setBrand("State Bank of India");
  };

  const handleFusion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !message.trim() && !screenshotText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanFusion({
        url: url || undefined,
        message: message || undefined,
        screenshot_text: screenshotText || undefined,
        brand_context: brand
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Threat Fusion failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/30 bg-gradient-to-r from-red-500/10 via-slate-900/80 to-blue-500/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase bg-red-500/20 text-red-400 border border-red-500/40">
              <Zap className="w-3.5 h-3.5" />
              National Cybersecurity Innovation
            </div>
            <h1 className="text-3xl font-black text-white mt-2">Cyber Threat Fusion Engine</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Instead of isolating threats, the Fusion Engine correlates disparate signals across URLs, SMS messages, 
              screenshots, and brand indicators to uncover coordinated nationwide scam campaigns.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPresetCampaign}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] shrink-0 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Load Threat Campaign Template</span>
          </button>
        </div>
      </div>

      {/* Input Sandbox */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <form onSubmit={handleFusion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vector 1: Suspicious URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span>Vector 1: Suspicious URL</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. http://sbi-rewards-yono.xyz/login.php"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Vector 2: Target Brand Context */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Target Brand Context</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Vector 3: Scam Message Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Vector 2: Scam SMS / WhatsApp Text</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste SMS or WhatsApp copy..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Vector 4: Screenshot Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-400" />
                <span>Vector 3: Screenshot Text / Payment Evidence</span>
              </label>
              <textarea
                rows={3}
                value={screenshotText}
                onChange={(e) => setScreenshotText(e.target.value)}
                placeholder="Paste extracted text from suspicious payment receipt..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || (!url.trim() && !message.trim() && !screenshotText.trim())}
              className="px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Correlating Threat Artifacts...</span>
                </>
              ) : (
                <>
                  <Network className="w-4 h-4" />
                  <span>Execute Threat Fusion Engine</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Fusion Engine Output */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-red-500/40 space-y-6 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded border border-red-500/40">
                  {result.suggested_cluster_code}
                </span>
                <span className="text-xs text-slate-400">Threat Cluster Match</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1.5">{result.campaign_name}</h2>
            </div>
            <ThreatBadge level={result.campaign_risk} />
          </div>

          {/* Fusion Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <RiskGauge score={result.combined_risk_score} size={150} />
              <span className="text-xs font-bold text-slate-400 block mt-2">Combined Threat Score</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">AI Cluster Confidence</span>
              <p className="text-3xl font-black text-cyan-400">{result.confidence}%</p>
              <p className="text-[11px] text-slate-500">Cross-Vector Validation</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-center text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Correlated Signals</span>
              <p className="text-3xl font-black text-amber-400">{result.signals_correlated} Vectors</p>
              <p className="text-[11px] text-slate-500">Multi-Channel Active Fraud</p>
            </div>
          </div>

          {/* Correlated Signals Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Correlated Vector Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.signals.map((sig, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">{sig.source}</span>
                    <span className="text-xs font-bold text-slate-300">{sig.risk_score}/100</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">{sig.preview}</p>
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    {sig.indicators.slice(0, 2).map((ind, j) => (
                      <p key={j} className="text-[10px] text-slate-400 truncate">• {ind}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Suspicious Patterns */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shared Pattern Signatures</h3>
            <div className="flex flex-wrap gap-2">
              {result.shared_patterns.map((pat, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {pat}
                </span>
              ))}
            </div>
          </div>

          {/* Fusion Explanation */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">AI Campaign Correlation Rationale</span>
            <p className="text-xs text-slate-300 leading-relaxed">{result.fusion_explanation}</p>
          </div>

          {/* Recommended Containment Guidance */}
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400">National / Enterprise Containment Actions</h3>
            <ul className="space-y-1.5">
              {result.recommended_containment.map((action, i) => (
                <li key={i} className="text-xs text-red-200 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
