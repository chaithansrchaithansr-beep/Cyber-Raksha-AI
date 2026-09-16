import React, { useState } from 'react';
import { useLanguage } from '../store/LanguageContext';
import { Settings, Globe, Bell, Shield, CheckCircle2, Lock } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalSms, setCriticalSms] = useState(true);
  const [autoSanitize, setAutoSanitize] = useState(true);
  const [saved, setSaved] = useState(false);

  const languages = [
    { code: 'en', name: 'English (Default)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configurations</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Platform Settings</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Customize multi-language preferences, real-time alert delivery, and threat scoring sensitivity.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {/* Language Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Indian Regional Language Preferences (Module 28)
        </h2>
        <p className="text-xs text-slate-400">
          CYBER RAKSHA AI supports 7 official Indian languages for accessible citizen cyber defense.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code as any)}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                language === l.code
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Real-Time Alert Dispatch
        </h2>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">Email Intelligence Summaries</span>
              <span className="text-[11px] text-slate-400">Receive verified campaign alerts impacting your state.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-white block">Critical Severity Emergency Broadcasts</span>
              <span className="text-[11px] text-slate-400">Immediate high-priority warnings for critical banking campaigns.</span>
            </div>
            <input
              type="checkbox"
              checked={criticalSms}
              onChange={(e) => setCriticalSms(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          PII Masking & Citizen Privacy
        </h2>

        <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
          <div>
            <span className="text-xs font-bold text-white block">Automatic PII Redaction Engine</span>
            <span className="text-[11px] text-slate-400">Mask phone numbers, emails, Aadhaar, and OTPs prior to storing telemetry.</span>
          </div>
          <input
            type="checkbox"
            checked={autoSanitize}
            onChange={(e) => setAutoSanitize(e.target.checked)}
            className="w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700"
          />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};
