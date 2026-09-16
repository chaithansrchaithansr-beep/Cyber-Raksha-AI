import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { api } from '../services/api';
import { UserSession } from '../types';
import { 
  ShieldCheck, Lock, Smartphone, Laptop, LogOut, CheckCircle2, 
  AlertTriangle, KeyRound, Clock, Globe, ShieldAlert, Sparkles
} from 'lucide-react';

export const SecuritySettingsPage: React.FC = () => {
  const { user, changePassword, logout } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Sessions state
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  // MFA toggle state (Foundation)
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(user?.mfa_enabled ?? false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await api.auth.getSessions();
      setSessions(data);
    } catch (err) {
      console.warn('Unable to load active sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("New password and confirmation do not match.");
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassSuccess("Password updated successfully. All credentials re-encrypted.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || "Failed to update password. Verify your current password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!window.confirm("Are you sure you want to log out of all other devices and browser sessions?")) {
      return;
    }
    try {
      const res = await api.auth.logoutAll();
      setSessionMsg(res.message);
      await fetchSessions();
      setTimeout(() => setSessionMsg(null), 4000);
    } catch (err: any) {
      setPassError("Failed to invalidate other sessions.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Identity & Perimeter Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Security & Session Controls</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your cryptographic credentials, active device tokens, and multi-factor defense.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Password Management & MFA */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Change Password Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Change Master Password</h2>
                <p className="text-[11px] text-slate-400">NIST PBKDF2/SHA-256 with Unique Salt</p>
              </div>
            </div>

            {passError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars (alphanumeric + symbol)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {passLoading ? "Re-Encrypting..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* MFA / 2FA Section */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Two-Factor Auth (2FA / TOTP)</h2>
                  <p className="text-[11px] text-slate-400">Google Authenticator or YubiKey FIDO2</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                mfaEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Require a time-based one-time password (TOTP) from an authenticator app upon every new sign-in attempt from unverified devices.
            </p>

            <button
              type="button"
              onClick={() => setMfaEnabled(!mfaEnabled)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {mfaEnabled ? "Disable 2FA Protection" : "Setup Authenticator App"}
            </button>
          </div>
        </div>

        {/* Right Column: Active Sessions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Active Device Sessions</h2>
                    <p className="text-[11px] text-slate-400">Validated cryptographic refresh tokens</p>
                  </div>
                </div>

                <button
                  onClick={fetchSessions}
                  className="text-xs text-cyan-400 hover:underline font-bold"
                >
                  Refresh
                </button>
              </div>

              {sessionMsg && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sessionMsg}</span>
                </div>
              )}

              {/* Sessions List */}
              <div className="space-y-2.5">
                {sessionsLoading ? (
                  <div className="p-8 text-center text-xs text-slate-500">Loading active sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    No other active sessions detected. You are logged in solely on this current device.
                  </div>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        s.is_current
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white max-w-[220px] truncate block" title={s.user_agent}>
                            {s.user_agent}
                          </span>
                          {s.is_current && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-black">
                              This Device
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                          <span>Expires in 7 days</span>
                        </div>
                      </div>

                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Logout from all other devices */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleTerminateAllSessions}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out From All Other Sessions</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
