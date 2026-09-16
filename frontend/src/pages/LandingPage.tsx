import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import { 
  Shield, Network, QrCode, Mail, MessageSquare, Globe, Camera,
  ArrowRight, CheckCircle2, Lock, Zap, MapPin, Eye, AlertTriangle, 
  Cpu, Building2, User, ShieldCheck, Activity, Sparkles, PhoneCall
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const coreModules = [
    { 
      title: "AI Phishing URL Detector", 
      desc: "Lexical entropy, lookalike brand signatures, and algorithmic DGA detection with random forest classification.", 
      icon: Globe, 
      link: "/scan/url", 
      badge: "AI 96.4%",
      color: "from-cyan-500/20 to-blue-500/20",
      border: "hover:border-cyan-500/50"
    },
    { 
      title: "SMS & WhatsApp Scam Radar", 
      desc: "Specialized NLP for Indian fraud taxonomy: UPI PIN cashback traps, electricity bill extortion, and fake Telegram jobs.", 
      icon: MessageSquare, 
      link: "/scan/message", 
      badge: "UPI / SMS",
      color: "from-blue-500/20 to-indigo-500/20",
      border: "hover:border-blue-500/50"
    },
    { 
      title: "Payment Receipt OCR Auditor", 
      desc: "Computer vision heuristics detecting fake PhonePe/GPay/Paytm payment screenshots, font discrepancies, and synthetic UTRs.", 
      icon: Camera, 
      link: "/scan/screenshot", 
      badge: "OCR Vision",
      color: "from-purple-500/20 to-pink-500/20",
      border: "hover:border-purple-500/50"
    },
    { 
      title: "QR Code Security Auditor", 
      desc: "Decodes and inspects malicious QR destinations, detecting hidden UPI debit intent triggers before citizen interaction.", 
      icon: QrCode, 
      link: "/scan/qr", 
      badge: "Zero-Trust",
      color: "from-amber-500/20 to-orange-500/20",
      border: "hover:border-amber-500/50"
    },
    { 
      title: "Email Social Engineering Defense", 
      desc: "Scrutinizes deceptive sender display names, urgency extortion patterns, and credential harvesting forms.", 
      icon: Mail, 
      link: "/scan/email", 
      badge: "Heuristic",
      color: "from-emerald-500/20 to-teal-500/20",
      border: "hover:border-emerald-500/50"
    },
    { 
      title: "Cyber Threat Fusion Engine", 
      desc: "Correlates disparate citizen reports across URLs, SMS, OCR, and QR into unified nationwide scam clusters.", 
      icon: Network, 
      link: "/fusion", 
      badge: "Core Innovation", 
      color: "from-red-500/20 to-rose-500/20",
      border: "hover:border-red-500/50"
    }
  ];

  return (
    <div className="space-y-20 py-4 sm:py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 glass-card-premium">
        {/* Cyber Light Orbs */}
        <div className="absolute -right-20 -top-20 w-[450px] h-[450px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>NATIONAL CYBER DEFENSE INITIATIVE 🇮🇳</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
            CYBER RAKSHA{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            A unified, AI-powered national cyber threat intelligence and digital scam defense platform. 
            Correlating phishing links, fraudulent WhatsApp messages, fake payment receipts, and malicious QR codes into actionable national threat intelligence.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to={isAuthenticated ? "/citizen/dashboard" : "/login"}
              className="px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black shadow-[0_0_30px_rgba(0,229,255,0.4)] flex items-center gap-2 transition-all active:scale-95"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Access Defense Portal"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/scan/url"
              className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center gap-2 transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Explore Threat Scanners</span>
            </Link>
          </div>
        </div>

        {/* Floating Metrics Badge */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Threats Audited</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 font-mono">18,400+</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Campaigns Clustered</p>
            <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1 font-mono">142 Clusters</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Citizens Protected</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">94,250+</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Emergency Helpline</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">1930 Active</p>
          </div>
        </div>
      </section>

      {/* Persona Portals Overview */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Multi-Tier Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Tailored Security for Every Defense Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Role-governed security access for citizens, enterprise defense teams, and national CERT officers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Citizen Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 space-y-4 hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">Level 1 Clearance</span>
                <h3 className="text-lg font-black text-white">Citizen Protection</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan suspicious links, analyze deceptive WhatsApp messages, verify payment receipts, and report scams with automated PII masking.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 text-center hover:bg-emerald-500/25 transition-all"
            >
              Access Citizen Portal
            </Link>
          </div>

          {/* Organization Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-blue-500/30 space-y-4 hover:border-blue-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-400">Level 2 Clearance</span>
                <h3 className="text-lg font-black text-white">Enterprise Brand Defense</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Defend corporate domains, identify brand impersonation phishing attacks, manage incident triage, and collaborate across SecOps teams.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 text-center hover:bg-blue-500/25 transition-all"
            >
              Access Enterprise Console
            </Link>
          </div>

          {/* Admin SecOps Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 space-y-4 hover:border-purple-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Level 3 Clearance</span>
                <h3 className="text-lg font-black text-white">SecOps Command Center</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                National threat fusion correlation, India threat heatmap intelligence, AI model performance monitoring, and emergency alert radar.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 text-center hover:bg-purple-500/25 transition-all"
            >
              Access SecOps Command
            </Link>
          </div>
        </div>
      </section>

      {/* Threat Scanners Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              Multi-Vector Scanners
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Comprehensive Threat Detection Suite
            </h2>
          </div>
          <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5">
            <span>Explore All Scanners</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod, idx) => {
            const IconComp = mod.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl bg-slate-900/70 border border-slate-800 transition-all duration-300 ${mod.border} flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {mod.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{mod.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 pt-2"
                >
                  <span>Launch Detector</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Innovation: Threat Fusion Showcase */}
      <section className="glass-card-premium p-8 lg:p-12 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/30">
              <Zap className="w-3.5 h-3.5" />
              CORE INNOVATION
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Cyber Threat Fusion Engine
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Traditional tools analyze threats in silos. CYBER RAKSHA AI introduces cross-vector correlation: 
              combining suspicious URLs, scam SMS copy, fake payment screenshots, and QR codes to detect nationwide scam campaigns in real-time.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
              >
                <span>Launch Interactive Threat Fusion Sandbox</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-96 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span>Threat Correlation Sandbox</span>
              <span className="text-emerald-400">STATUS: FUSED</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">
              <span className="text-red-400 font-bold">SIGNAL 1:</span> http://sbi-rewards-yono.xyz
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">
              <span className="text-amber-400 font-bold">SIGNAL 2:</span> SMS: 'Redeem points before tonight'
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 border border-slate-800">
              <span className="text-blue-400 font-bold">SIGNAL 3:</span> OCR: Fake SBI NetBanking Screenshot
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <span className="font-bold">FUSED CAMPAIGN:</span> CR-2026-00305 (SBI YONO KYC UPI Trap)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
