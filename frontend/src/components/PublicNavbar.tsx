import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../store/LanguageContext';
import { useAlerts } from '../store/AlertContext';
import { Language } from '../types';
import { 
  Shield, Globe, Radio, ArrowRight, Lock, 
  Menu, X, ChevronDown, Sparkles, Activity, ShieldCheck
} from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { alerts } = useAlerts();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'mr', name: 'मराठी (Marathi)' }
  ];

  const currentLangLabel = languages.find(l => l.code === language)?.name || 'English';

  const navLinks = [
    { name: 'Overview', href: '/' },
    { name: 'Scanners', href: '/scan/url' },
    { name: 'Threat Radar', href: '/heatmap' },
    { name: 'Cyber Academy', href: '/academy' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-xl">
      {/* Top National Threat Intelligence Ticker */}
      <div className="bg-slate-950/90 border-b border-slate-800/90 px-4 py-1.5 text-[11px] sm:text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1.5 text-cyan-400 font-extrabold uppercase tracking-wider shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            NATIONAL DEFENSE FEED:
          </span>
          <span className="text-slate-300 font-mono truncate">
            {alerts[0]?.title || "Active National Cyber Defense: Correlating 18,400+ domain telemetry streams across Indian cyberspace."}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span>Helpline:</span>
            <strong className="text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">1930</strong>
          </span>
          <span className="text-slate-700">|</span>
          <span>Portal: <strong className="text-slate-300 font-medium">cybercrime.gov.in</strong></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & National Seal */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,229,255,0.7)] transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black text-white tracking-wide">
                CYBER RAKSHA
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold hidden sm:block">
              National Threat Intelligence & Scam Defense
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="px-2.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 flex items-center gap-1.5 transition-all"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-sans text-xs">{currentLangLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Select Language
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{l.name}</span>
                    {language === l.code && <Sparkles className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authentication Actions */}
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800/80 border border-slate-700/80 flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sign In</span>
          </Link>

          <Link
            to="/register"
            className="hidden sm:flex px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_20px_rgba(0,229,255,0.35)] items-center gap-1.5 transition-all active:scale-95"
          >
            <span>Get Protected</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-5 space-y-3 animate-in slide-in-from-top">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-cyan-400 hover:bg-slate-900"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800"
            >
              Sign In to Platform
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-black"
            >
              Register Free Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
