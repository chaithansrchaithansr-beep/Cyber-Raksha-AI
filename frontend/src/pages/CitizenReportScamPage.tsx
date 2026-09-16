import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldAlert, Send, CheckCircle2, AlertTriangle, ArrowRight, 
  HelpCircle, Eye, EyeOff, Lock, FileText, Info
} from 'lucide-react';

export const CitizenReportScamPage: React.FC = () => {
  const navigate = useNavigate();
  const [threatType, setThreatType] = useState('upi_fraud');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [indicatorsText, setIndicatorsText] = useState('');
  const [stateRegion, setStateRegion] = useState('National / Online');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<any | null>(null);

  const indianStates = [
    "National / Online", "Andhra Pradesh", "Assam", "Bihar", "Delhi NCR", 
    "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", 
    "Uttar Pradesh", "West Bengal", "Other State / UT"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both the scam summary title and full incident details.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Extract indicators split by newline or comma
    const rawIndicators = indicatorsText
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        threat_type: threatType,
        indicators: rawIndicators.length > 0 ? rawIndicators : [title.trim()],
        state: stateRegion
      };

      const res = await api.threats.submitReport(payload);
      setSuccessReport(res);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Citizen Defense • Incident Reporting</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Report a Cyber Scam or Threat</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Help protect fellow citizens by reporting phishing links, fraudulent UPI IDs, fake lottery messages, and cyber extortion.
        </p>
      </div>

      {successReport ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 bg-emerald-500/5 space-y-6 animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Scam Incident Successfully Logged</h2>
              <p className="text-xs text-slate-300">
                Your report has been received and assigned a National Incident Tracking ID. Our security operations and automated clustering engines will correlate this with ongoing threat campaigns.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-500">REPORT ID:</span>
              <span className="font-bold text-cyan-400">CR-REP-{String(successReport.id).padStart(5, '0')}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-500">INITIAL STATUS:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold text-[10px]">
                {successReport.status || 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">TITLE:</span>
              <span className="text-slate-200 truncate max-w-xs">{successReport.title}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessReport(null);
                setTitle('');
                setDescription('');
                setIndicatorsText('');
              }}
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center"
            >
              Submit Another Report
            </button>
            <Link
              to="/citizen/my-reports"
              className="px-6 py-3 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
            >
              <span>Track in My Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Incident Classification Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              1. Threat Category & Region
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Scam / Threat Type</label>
                <select
                  value={threatType}
                  onChange={(e) => setThreatType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="upi_fraud">UPI / QR Fraud (Fake Payment / Debit Request)</option>
                  <option value="phishing_url">Phishing Website / Banking Impersonation Link</option>
                  <option value="fake_sms">Fake SMS / WhatsApp OTP Scam</option>
                  <option value="voice_call_scam">Impersonation Call / Digital Arrest Scam</option>
                  <option value="malicious_apk">Malicious Android App / WhatsApp APK</option>
                  <option value="fake_job_offer">Part-Time Work / Telegram Task Scam</option>
                  <option value="crypto_investment">Fake Crypto / Trading Scheme</option>
                  <option value="other">Other Cyber Threat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">State / Location</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Incident Information */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              2. Incident Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Summary Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Received fake electricity bill SMS demanding payment via unauthorized UPI handle"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Suspicious Indicators (URLs, Phone Numbers, UPI handles, Bank names)
                </label>
                <textarea
                  rows={2}
                  value={indicatorsText}
                  onChange={(e) => setIndicatorsText(e.target.value)}
                  placeholder="Enter items separated by lines or commas: e.g.&#10;payelectric@okicici&#10;+91 98765 43210&#10;https://ebill-update.xyz"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Detailed Narrative <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened: how the scammer approached you, what they asked you to do, any apps they asked to download (AnyDesk, TeamViewer), etc."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            {/* Privacy Safeguard Note */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Privacy Protection:</strong> Do not submit your own bank passwords, ATM PINs, or private OTP codes. Cyber Raksha AI sanitizes personal identifiers before generating national threat intelligence models.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/citizen/dashboard')}
              className="px-6 py-3.5 rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_25px_rgba(0,229,255,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting to Threat Radar...</span>
              ) : (
                <>
                  <span>Submit Incident Report</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
