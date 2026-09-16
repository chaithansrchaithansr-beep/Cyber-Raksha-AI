import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { 
  User as UserIcon, Shield, KeyRound, Award, CheckCircle2, 
  Lock, Smartphone, Laptop, Clock, ArrowRight, ShieldCheck, Globe
} from 'lucide-react';
import { Language } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState<Language>(user?.language || 'en');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ name, language });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.warn("Update profile failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <UserIcon className="w-4 h-4" />
            <span>Identity & Profile Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">User Security Profile</h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage personal information, platform language, and access security center.
          </p>
        </div>

        <Link
          to="/security"
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <span>Security & Sessions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile preferences updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 text-center space-y-4 shadow-lg">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-3xl mx-auto shadow-[0_0_25px_rgba(0,229,255,0.3)]">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <h2 className="text-lg font-black text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Role: {user?.role}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold">Verified</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>MFA Protection:</span>
              <span className="text-purple-400 font-bold">{user?.mfa_enabled ? 'TOTP Active' : 'Standard'}</span>
            </div>
            {user?.last_login && (
              <div className="flex justify-between text-slate-400">
                <span>Last Sign-In:</span>
                <span className="text-slate-300 text-[10px]">{new Date(user.last_login).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-lg">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Personal Information</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update how your identity appears on verified incident telemetry and reports.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Account Email (Immutable)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Interface Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <Link
                to="/security"
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                Change password & view active devices →
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
              >
                {loading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
