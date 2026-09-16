import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ThreatReport } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { Users, ShieldAlert, ThumbsUp, Send, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export const ThreatIntelligencePage: React.FC = () => {
  const [reports, setReports] = useState<ThreatReport[]>([]);
  const [threatType, setThreatType] = useState('kyc_scam');
  const [content, setContent] = useState('');
  const [targetBrand, setTargetBrand] = useState('State Bank of India');
  const [state, setState] = useState('Delhi');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<ThreatReport | null>(null);

  const loadReports = async () => {
    try {
      const data = await api.threats.getReports();
      setReports(data);
    } catch (e) {
      console.error('Failed to load reports', e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.threats.submitReport({
        threat_type: threatType,
        severity: "HIGH",
        target_brand: targetBrand,
        content: content,
        state: state
      });
      setSubmittedReport(res);
      setContent('');
      loadReports();
    } catch (e) {
      console.error('Report submission failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id: number) => {
    try {
      await api.threats.upvoteReport(id);
      setReports(prev => prev.map(r => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r));
    } catch (e) {
      console.error(e);
    }
  };

  const loadSampleReport = () => {
    setContent("Received fraudulent message: 'Dear Customer, your SBI account 1234567890 will be blocked today! Contact officer Aarav at +91 98765 43210 or email test@gmail.com with your OTP 482910 to update KYC immediately: http://sbi-kyc-verify.xyz'");
    setTargetBrand("State Bank of India");
    setThreatType("kyc_scam");
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Module 08 • Privacy-Preserving Citizen Telemetry</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Community Threat Intelligence</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Crowdsourced threat reports sanitized in real-time. Sensitive PII (OTPs, phone numbers, Aadhaar, bank accounts) is stripped before storage.
        </p>
      </div>

      {/* PII Sanitization Reporting Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            Report Suspicious Incident (With Auto-PII Masking)
          </h2>
          <button
            type="button"
            onClick={loadSampleReport}
            className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold"
          >
            Load Sample Unsanitized Threat Message
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Threat Type</label>
              <select
                value={threatType}
                onChange={(e) => setThreatType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="kyc_scam">KYC / Bank Suspension</option>
                <option value="upi_fraud">UPI / QR Payment Fraud</option>
                <option value="fake_job">Fake Part-Time Job Scam</option>
                <option value="electricity_bill">Electricity Bill Cut-off</option>
                <option value="phishing_url">Phishing Website / APK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Impersonated Brand</label>
              <input
                type="text"
                value={targetBrand}
                onChange={(e) => setTargetBrand(e.target.value)}
                placeholder="e.g. SBI, HDFC, Paytm"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Incident State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Telangana">Telangana</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Raw Threat Message or Details (Will be automatically sanitized)
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw scam message or suspicious details here..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Automatic PII Sanitizer Enabled
            </span>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Sanitizing & Submitting..." : "Submit Anonymous Report"}</span>
            </button>
          </div>
        </form>

        {/* Live PII Masking Demonstration Box */}
        {submittedReport && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Report Sanitized & Added to Community Threat Stream
            </span>
            <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-slate-200">
              {submittedReport.sanitized_content}
            </div>
            <p className="text-[11px] text-slate-400">
              Notice: All personal phone numbers, emails, account numbers, and OTPs were masked before storage.
            </p>
          </div>
        )}
      </div>

      {/* Community Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
          Anonymous Community Threat Feed ({reports.length} Verified Submissions)
        </h2>

        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {rep.state}
                  </span>
                  <span className="text-xs font-bold text-slate-300 capitalize">
                    {rep.threat_type.replace('_', ' ')}
                  </span>
                  {rep.target_brand && (
                    <span className="text-[11px] text-slate-500">targeting {rep.target_brand}</span>
                  )}
                </div>
                <ThreatBadge level={rep.severity} />
              </div>

              <p className="text-xs text-slate-200 font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                {rep.sanitized_content}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Status: <strong className="text-emerald-400 uppercase">{rep.status}</strong></span>
                <button
                  onClick={() => handleUpvote(rep.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verify / Upvote ({rep.upvotes})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
