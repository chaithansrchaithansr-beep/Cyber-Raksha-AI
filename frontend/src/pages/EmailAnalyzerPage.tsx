import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { Mail, ShieldAlert, ArrowRight, Download, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const EmailAnalyzerPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleEmails = [
    {
      label: "🚨 Phishing: Urgent KYC Deactivation",
      sub: "FINAL NOTICE: Your Bank Account Access Is Restricted",
      from: "security-alert@bank-update-sbi.xyz",
      content: "Dear Valued Customer, We detected unauthorized attempts to access your netbanking. Your account will be permanently deactivated within 12 hours unless you confirm your identity. Click the link below to verify your PAN and ATM PIN: http://secure-sbi-portal.xyz/verify.php"
    },
    {
      label: "🚨 Lottery: Kaun Banega Crorepati Winner",
      sub: "Congratulations! You won Rs 25,00,000 in KBC Lucky Draw",
      from: "kbc-prize-department@lottery-winner.net",
      content: "Dear Winner, Your mobile number was selected in the KBC All India WhatsApp Lucky Draw! To claim your cash prize of Rs 25 Lakhs, deposit the government customs processing fee of Rs 12,500 via UPI immediately."
    }
  ];

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanEmail({ subject, sender, body });
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
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Mail className="w-4 h-4" />
          <span>Module 02 • Social Engineering & Header Inspection</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">AI Scam Email Detector</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Scrutinizes sender domain authenticity, credential harvesting links, urgency manipulation, and financial deception.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. URGENT: Account Suspension Notice"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Sender Domain / Email</label>
              <input
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="e.g. security-team@sbi-update.xyz"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Body Content</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste full email body text here..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !subject.trim() || !body.trim()}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Email...</span>
                </>
              ) : (
                <>
                  <span>Analyze Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase text-slate-500">Test Samples:</span>
          {sampleEmails.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setSubject(s.sub); setSender(s.from); setBody(s.content); }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white transition-all font-mono"
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
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Threat Assessment</span>
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  AI Threat Explanation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

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
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Incident Report (PDF)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
