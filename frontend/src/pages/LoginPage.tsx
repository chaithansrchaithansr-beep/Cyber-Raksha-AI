import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { 
  Shield, Lock, Mail, Eye, EyeOff, CheckCircle2, 
  AlertTriangle, ArrowRight, Building2, User, 
  ShieldCheck, Activity, KeyRound, Sparkles, Check,
  Fingerprint, Key, Server
} from 'lucide-react';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role resolution from URL or default
  const paramRole = searchParams.get('role') as Role;
  const initialRole: Role = (paramRole && ['citizen', 'organization', 'admin'].includes(paramRole)) 
    ? paramRole 
    : 'citizen';

  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  
  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Professional Role Metadata
  const roleConfigs: Record<Role, {
    title: string;
    portalName: string;
    badge: string;
    color: string;
    border: string;
    bgAccent: string;
    textAccent: string;
    icon: any;
    defaultEmail: string;
    defaultPass: string;
    clearance: string;
    description: string;
    capabilities: string[];
  }> = {
    citizen: {
      title: "Citizen Portal",
      portalName: "National Citizen Defense Gateway",
      badge: "Public Safety Tier",
      color: "from-emerald-500 to-teal-600",
      border: "border-emerald-500/40",
      bgAccent: "bg-emerald-500/10",
      textAccent: "text-emerald-400",
      icon: User,
      defaultEmail: "citizen@cyberraksha.gov.in",
      defaultPass: "Citizen@123",
      clearance: "Citizen Tier • Personal Shield",
      description: "Autonomous scanner console for phishing URLs, malicious SMS/WhatsApp texts, fraudulent payment screenshots, and QR payloads.",
      capabilities: [
        "AI Phishing & Evasion URL Scanner",
        "SMS & WhatsApp Scam Classifier (UPI PIN Traps)",
        "Manipulated Payment Screenshot OCR Auditor",
        "Community Threat Reporting with Automated PII Masking"
      ]
    },
    organization: {
      title: "Enterprise SecOps",
      portalName: "Enterprise Brand Defense Console",
      badge: "Enterprise Security Tier",
      color: "from-blue-500 to-cyan-600",
      border: "border-blue-500/40",
      bgAccent: "bg-blue-500/10",
      textAccent: "text-cyan-400",
      icon: Building2,
      defaultEmail: "org@infosec-defense.in",
      defaultPass: "OrgAdmin@123",
      clearance: "Enterprise Tier • Corporate Defense",
      description: "Corporate domain monitoring, brand impersonation radar, threat triage workflows, and SecOps incident response.",
      capabilities: [
        "Brand Impersonation & Typosquatting Radar",
        "Enterprise Incident Triage & CERT-In Export",
        "Organization-Scoped Threat Telemetry Feeds",
        "Multi-User SecOps Team Management & API Keys"
      ]
    },
    admin: {
      title: "National Command",
      portalName: "National Cyber Command & Control (CERT-In)",
      badge: "National Defense Tier",
      color: "from-purple-600 to-indigo-600",
      border: "border-purple-500/40",
      bgAccent: "bg-purple-500/10",
      textAccent: "text-purple-400",
      icon: ShieldCheck,
      defaultEmail: "admin@cyberraksha.gov.in",
      defaultPass: "CyberRaksha@Admin2026",
      clearance: "National Defense Tier • SecOps Command",
      description: "Central cyber intelligence oversight, cross-vector threat fusion clustering, geospatial India heatmap, and automated incident response advisories.",
      capabilities: [
        "Autonomous Multi-Vector Threat Fusion Engine",
        "State-Level Geospatial Privacy Heatmap Intelligence",
        "AI Model Benchmarking & Continuous Retraining",
        "Real-Time National Threat Radar Broadcast"
      ]
    }
  };

  const handleRoleSelect = (r: Role) => {
    setSelectedRole(r);
    setError(null);
    setSuccessMsg(null);
  };

  const handleFillTestCredentials = () => {
    setEmail(roleConfigs[selectedRole].defaultEmail);
    setPassword(roleConfigs[selectedRole].defaultPass);
    setError(null);
  };

  const handleRoleRedirect = (role: Role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'organization') navigate('/organization/dashboard');
    else navigate('/citizen/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setError("Please provide both your registered email address and password.");
      return;
    }

    try {
      const user = await login({ email, password, remember_me: rememberMe });
      setSuccessMsg(`Identity verified. Welcome back, ${user.name}. Accessing defense console...`);
      setTimeout(() => {
        handleRoleRedirect(user.role);
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials or select an authorized portal tier.');
    }
  };

  const currentConfig = roleConfigs[selectedRole];
  const IconComponent = currentConfig.icon;

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 sm:py-10">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-card-premium border border-slate-800/90 shadow-2xl relative">
        
        {/* Ambient Backlight Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* LEFT PANEL: National Defense Architecture & Security Clearance */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/90 relative overflow-hidden">
          <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            {/* National Crest & Portal Identity */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
                  <span>CYBER RAKSHA</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500 text-black font-black">AI</span>
                </h1>
                <p className="text-[11px] text-cyan-300 font-medium">National Cyber Defense Access Gateway</p>
              </div>
            </div>

            {/* Selected Security Clearance Profile */}
            <div className={`p-5 rounded-2xl bg-slate-900/90 border ${currentConfig.border} transition-all duration-300 space-y-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${currentConfig.bgAccent} flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${currentConfig.textAccent}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{currentConfig.title}</h3>
                    <p className="text-[10px] text-slate-400">{currentConfig.clearance}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${currentConfig.bgAccent} ${currentConfig.textAccent} border ${currentConfig.border}`}>
                  {currentConfig.badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentConfig.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Authorized Security Capabilities:
                </span>
                {currentConfig.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className={`w-3.5 h-3.5 ${currentConfig.textAccent} shrink-0`} />
                    <span className="text-[11px]">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operational Telemetry Indicators */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  Telemetry Feeds
                </span>
                <p className="text-base font-black text-white font-mono mt-1">18,400+ Active</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Zero Trust
                </span>
                <p className="text-base font-black text-cyan-400 font-mono mt-1">NIST SP 800-63B</p>
              </div>
            </div>
          </div>

          {/* Compliance & Verification Markers */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>CERT-In Aligned</span>
            <span>•</span>
            <span>SHA-256 Verified</span>
            <span>•</span>
            <span>256-Bit TLS</span>
          </div>
        </div>

        {/* RIGHT PANEL: Enterprise Access Form & Role Gateway */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-slate-950/95 flex flex-col justify-between space-y-6">
          <div>
            {/* Title & Gateway Description */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight">Security Gateway Authentication</h2>
              <p className="text-xs text-slate-400">
                Authenticate with your organization account or access authorized security tiers.
              </p>
            </div>

            {/* Notification Alerts */}
            {error && (
              <div className="mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Portal Role Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Select Security Portal Tier
                </label>
                <button
                  type="button"
                  onClick={handleFillTestCredentials}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
                  title="Autofill authorized credentials for this security tier"
                >
                  <Key className="w-3 h-3" />
                  <span>Use Tier Credentials</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('citizen')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedRole === 'citizen'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Citizen Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('organization')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedRole === 'organization'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Enterprise SecOps</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>National Command</span>
                </button>
              </div>
            </div>

            {/* Standard Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@cyberraksha.gov.in"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">Security Passcode / Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Forgot Credentials?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span>Maintain verified session (7 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_25px_rgba(0,229,255,0.3)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating Identity...</span>
                ) : (
                  <>
                    <span>Authorize & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* National Single Sign-On (SSO) Assurance */}
            <div className="mt-5 p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                <span>Single Sign-On (SSO) & Biometric Auth Ready</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">e-Pramaan • NIST</span>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              New entity or organization?{' '}
              <Link to="/register" className="text-cyan-400 font-bold hover:underline">
                Register Defense Node
              </Link>
            </p>
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              ← Return to Portal Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
