import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  MessageSquare, ShieldAlert, ArrowRight, Download, CheckCircle2,
  AlertTriangle, RefreshCw, Send
} from 'lucide-react';

export const MessageScannerPage: React.FC = () => {
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('SMS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleMessages = [
    {
      label: "💸 UPI PIN Cashback Trap",
      channel: "WhatsApp",
      val: "Congratulations! You have received a cashback of Rs 4,999 from PhonePe. Enter your UPI PIN immediately to receive the money directly into your bank account!"
    },
    {
      label: "⚡ Electricity Bill Disconnection",
      channel: "SMS",
      val: "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the power sub-station because your previous month bill was not updated. Please immediately call officer at 9876543210."
    },
    {
      label: "💼 Telegram Part-Time Job Scam",
      channel: "Telegram",
      val: "Earn Rs 3,000 to Rs 8,000 daily working from home! Simple task: like YouTube videos and submit screenshots. Join our Telegram VIP task group: t.me/vip_task_earn. Initial deposit Rs 500 only."
    },
    {
      label: "🏦 Bank KYC Account Suspension",
      channel: "SMS",
      val: "Dear SBI User, your bank account will be blocked within 24 hours due to pending KYC. Update your PAN card immediately by downloading APK from http://sbi-kyc-update.xyz"
    }
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanMessage({ text, source_channel: channel });
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
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Module 03 • Indian Scam NLP Engine</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">SMS & WhatsApp Scam Detector</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Specialized threat analysis for UPI PIN traps, electricity bill disconnection extortion, KYC suspension, and fake task job schemes.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-slate-400">Source Platform:</span>
            {['SMS', 'WhatsApp', 'Telegram', 'Instagram'].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  channel === ch
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <textarea
            required
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste suspicious SMS, WhatsApp message, or Telegram job message text here..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">{text.length} characters</span>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>Scan Message</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase text-slate-500">Quick Test Scams:</span>
          {sampleMessages.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setText(s.val); setChannel(s.channel); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white transition-all"
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
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Scam Classification</span>
              <h3 className="text-xl font-black text-white mt-1">
                {result.details?.threat_type || result.classification}
              </h3>
            </div>
            <ThreatBadge level={result.classification} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <RiskGauge score={result.risk_score} size={160} />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  AI Threat Explanation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.detected_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Safety Recommendations</h4>
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
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Incident Report (PDF)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
