import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, PhoneCall, ExternalLink, ShieldCheck, 
  Lock, AlertTriangle, FileText, Globe2
} from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs mt-16 backdrop-blur-md relative z-10">
      {/* Top Banner: Emergency Direct Response */}
      <div className="bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-950 border-b border-slate-800/80 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                Fell victim to a cyber financial fraud?
              </p>
              <p className="text-slate-400 text-xs">
                Immediately dial National Cybercrime Helpline <strong>1930</strong> or file a complaint on the official portal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Call Helpline 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-black text-white text-base tracking-wide">
                CYBER RAKSHA <span className="text-cyan-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's AI-Powered National Cyber Threat Intelligence & Digital Scam Defense Platform. Correlating multi-vector cyber indicators for citizen and organizational resilience.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All Defense Nodes Operational</span>
            </div>
          </div>

          {/* Quick Threat Scanners */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Threat Scanners
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/scan/url" className="hover:text-cyan-400 transition-colors">AI Phishing URL Scanner</Link></li>
              <li><Link to="/scan/message" className="hover:text-cyan-400 transition-colors">SMS & WhatsApp Scam Detector</Link></li>
              <li><Link to="/scan/screenshot" className="hover:text-cyan-400 transition-colors">Payment Screenshot OCR Auditor</Link></li>
              <li><Link to="/scan/qr" className="hover:text-cyan-400 transition-colors">QR Code Security Auditor</Link></li>
              <li><Link to="/scan/email" className="hover:text-cyan-400 transition-colors">Social Engineering Email Scanner</Link></li>
            </ul>
          </div>

          {/* National Intelligence */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              National Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/fusion" className="hover:text-cyan-400 transition-colors">Threat Fusion Engine</Link></li>
              <li><Link to="/heatmap" className="hover:text-cyan-400 transition-colors">India Threat Heatmap</Link></li>
              <li><Link to="/academy" className="hover:text-cyan-400 transition-colors">Cyber Awareness Academy</Link></li>
              <li><Link to="/assistant" className="hover:text-cyan-400 transition-colors">AI Defense Assistant</Link></li>
              <li><Link to="/login" className="hover:text-cyan-400 transition-colors">SecOps Command Portal</Link></li>
            </ul>
          </div>

          {/* Security & Standards Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Compliance & Trust
            </h4>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>CERT-In Guidelines Aligned</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>NIST SP 800-63B Zero Trust</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Client & Server PII Masking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Integrity Bar */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 CYBER RAKSHA AI. National Cyber Safety Initiative. Built for defensive security & citizen protection.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-300">Citizen Login</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-slate-300">Enterprise Access</Link>
            <span>•</span>
            <Link to="/register" className="hover:text-slate-300">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
