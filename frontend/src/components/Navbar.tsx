import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useLanguage } from '../store/LanguageContext';
import { useAlerts } from '../store/AlertContext';
import { Language, Role } from '../types';
import { 
  Shield, Globe, Bell, User as UserIcon, LogOut, Radio, Zap, 
  Menu, X, Sparkles, Building2, UserCheck, Settings, ShieldCheck,
  ChevronDown, KeyRound, ArrowRight
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { alerts, simulateThreatEvent } = useAlerts();
  const [isSimulating, setIsSimulating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSimulate = async () => {
    setIsSimulating(true);
    await simulateThreatEvent();
    setTimeout(() => setIsSimulating(false), 800);
  };

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'mr', name: 'मराठी (Marathi)' }
  ];

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (r?: Role) => {
    if (r === 'admin') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (r === 'organization') return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      {/* Top Threat Ticker */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-1.5 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1 text-red-400 font-bold uppercase tracking-wider shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE THREAT RADAR:
          </span>
          <span className="text-slate-400 font-mono truncate">
            {alerts[0]?.title || "Active National Shield: Monitoring 18,400+ domain telemetry streams across Indian cyberspace."}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-[11px] text-slate-400">
          <span>National Cyber Helpline: <strong className="text-cyan-400">1930</strong></span>
          <span className="text-slate-600">|</span>
          <span>Reporting: <strong className="text-slate-300">cybercrime.gov.in</strong></span>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,229,255,0.7)] transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">CYBER RAKSHA</span>
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">National Cyber Threat Intelligence</p>
            </div>
          </Link>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* SECOPS THREAT DRILL BUTTON */}
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 disabled:opacity-50"
            title="Execute real-time defense drill to verify Cyber Threat Fusion Engine response"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t.simulateEvent}</span>
            <span className="sm:hidden">Drill</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowLangMenu(!showLangMenu); setShowUserMenu(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase font-mono">{language}</span>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 max-h-64 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Language (7 Languages)
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLanguage(l.code); setShowLangMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between ${
                      language === l.code ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* USER MENU DROPDOWN (Requirement 8) */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowLangMenu(false); }}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-xs shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white max-w-[100px] truncate leading-tight">
                    {user.name}
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                  {/* User Profile Info Header */}
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-black text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{user.email}</div>
                    <div className="mt-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/security"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-purple-400" />
                    <span>Security & Sessions</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <div className="border-t border-slate-800/80 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl flex items-center gap-2.5 transition-colors font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
