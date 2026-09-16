import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { 
  Shield, Lock, Mail, User, Building2, CheckCircle2, 
  AlertTriangle, ArrowRight, ArrowLeft, Eye, EyeOff, Check, Globe
} from 'lucide-react';
import { Role, Language } from '../types';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Basic Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Security
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 3: Account Type
  const [role, setRole] = useState<'citizen' | 'organization'>('citizen');
  const [orgName, setOrgName] = useState('');
  const [verifiedDomain, setVerifiedDomain] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (strengthScore <= 25) return { label: 'Weak', color: 'bg-red-500 text-red-400', width: '25%' };
    if (strengthScore <= 50) return { label: 'Fair', color: 'bg-amber-500 text-amber-400', width: '50%' };
    if (strengthScore <= 75) return { label: 'Good', color: 'bg-blue-500 text-blue-400', width: '75%' };
    return { label: 'Strong', color: 'bg-emerald-500 text-emerald-400', width: '100%' };
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!name.trim() || !email.trim()) {
        setError("Please provide your full name and email address.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please provide a valid email format.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long for NIST compliance.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please verify.");
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError("Please accept the Terms of Service & Digital Privacy Policy.");
      return;
    }

    if (role === 'organization' && !orgName.trim()) {
      setError("Please provide your organization name.");
      return;
    }

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        language,
        organization_name: role === 'organization' ? orgName : undefined,
        verified_domain: role === 'organization' ? (verifiedDomain || email.split('@')[1]) : undefined
      });

      // Role-based redirection after registration
      if (user.role === 'organization') navigate('/organization/dashboard');
      else navigate('/citizen/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="glass-card-premium p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)] mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Cyber Raksha Account</h1>
          <p className="text-xs sm:text-sm text-slate-400">Join the National Cyber Threat Intelligence & Scam Defense Platform</p>
        </div>

        {/* Multi-Step Indicator */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-5">
          <div className={`text-center pb-2 border-b-2 transition-all ${
            step === 1 ? 'border-cyan-400 text-cyan-400 font-bold' : step > 1 ? 'border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-600'
          }`}>
            <span className="text-[10px] uppercase tracking-wider block font-mono">Step 1</span>
            <span className="text-xs">Identity</span>
          </div>
          <div className={`text-center pb-2 border-b-2 transition-all ${
            step === 2 ? 'border-cyan-400 text-cyan-400 font-bold' : step > 2 ? 'border-emerald-500 text-emerald-400' : 'border-slate-800 text-slate-600'
          }`}>
            <span className="text-[10px] uppercase tracking-wider block font-mono">Step 2</span>
            <span className="text-xs">Security</span>
          </div>
          <div className={`text-center pb-2 border-b-2 transition-all ${
            step === 3 ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-slate-800 text-slate-600'
          }`}>
            <span className="text-[10px] uppercase tracking-wider block font-mono">Step 3</span>
            <span className="text-xs">Account Type</span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Basic Information */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="citizen@domain.in"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Verification and real-time security alerts will be routed here.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continue to Security</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Security */}
        {step === 2 && (
          <form onSubmit={handleNextStep} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-11 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Complexity:</span>
                    <span className={`font-bold ${getStrengthLabel().color.split(' ')[1]}`}>
                      {getStrengthLabel().label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthLabel().color.split(' ')[0]} transition-all duration-300`}
                      style={{ width: getStrengthLabel().width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue to Account Type</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Account Type & Submit */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Choose Persona Role</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setRole('citizen')}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    role === 'citizen'
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-4 h-4 ${role === 'citizen' ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black text-white">Citizen Account</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Personal scam protection, WhatsApp/SMS scanning & awareness tracks.</p>
                </div>

                <div
                  onClick={() => setRole('organization')}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    role === 'organization'
                      ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className={`w-4 h-4 ${role === 'organization' ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-black text-white">Organization Account</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Domain protection, brand impersonation radar & SecOps team triage.</p>
                </div>
              </div>
            </div>

            {role === 'organization' && (
              <div className="space-y-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Organization / Company Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Cyber Defense Pvt Ltd"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Primary Domain (To Defend)</label>
                  <input
                    type="text"
                    value={verifiedDomain}
                    onChange={(e) => setVerifiedDomain(e.target.value)}
                    placeholder="e.g. acme-defense.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Interface Language</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500"
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
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 mt-0.5 focus:ring-0"
                />
                <span>
                  I agree to the <strong className="text-slate-300">National Cyber Defense Policy</strong>, CERT-In compliance protocols, and privacy-preserving PII redaction terms.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Registering Node...</span>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-bold hover:underline">
            Sign In to Platform
          </Link>
        </div>
      </div>
    </div>
  );
};
