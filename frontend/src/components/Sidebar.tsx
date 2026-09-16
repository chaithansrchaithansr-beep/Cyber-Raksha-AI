import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../store/LanguageContext';
import { useAuth } from '../store/AuthContext';
import {
  ShieldAlert, Link2, Mail, MessageSquare, Globe2, Camera, QrCode,
  Network, Map, BarChart3, Users, Bell, FileText, History,
  Bot, GraduationCap, LayoutDashboard, Building, Settings,
  CheckSquare, ShieldCheck, User, Activity, Plus
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  path: string;
  name: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const role = user?.role || 'citizen';

  // Role-specific navigation definitions
  const citizenSections: NavSection[] = [
    {
      title: "Defense Center",
      items: [
        { path: "/citizen/dashboard", name: t.dashboard, icon: LayoutDashboard }
      ]
    },
    {
      title: "Core Threat Scanners",
      items: [
        { path: "/scan/url", name: t.urlScanner, icon: Link2, badge: "AI" },
        { path: "/scan/email", name: t.emailAnalyzer, icon: Mail },
        { path: "/scan/message", name: t.messageScanner, icon: MessageSquare, badge: "UPI/SMS" },
        { path: "/scan/screenshot", name: t.screenshotAnalyzer, icon: Camera, badge: "OCR" },
        { path: "/scan/qr", name: t.qrScanner, icon: QrCode },
        { path: "/scan/website", name: t.websiteAnalyzer, icon: Globe2 }
      ]
    },
    {
      title: "Defense Records",
      items: [
        { path: "/history", name: t.scanHistory, icon: History },
        { path: "/citizen/report-scam", name: "Report a Scam", icon: ShieldAlert, badge: "Report" },
        { path: "/citizen/my-reports", name: "My Scam Reports", icon: FileText },
        { path: "/reports", name: t.incidentReports, icon: FileText }
      ]
    },
    {
      title: "Support & Awareness",
      items: [
        { path: "/assistant", name: t.assistant, icon: Bot, badge: "AI" },
        { path: "/academy", name: t.academy, icon: GraduationCap, badge: "Gamified" },
        { path: "/alerts", name: t.threatAlerts, icon: Bell }
      ]
    },
    {
      title: "Account & Security",
      items: [
        { path: "/security", name: "Security & Sessions", icon: ShieldCheck, badge: "NIST" },
        { path: "/profile", name: "My Profile", icon: User },
        { path: "/settings", name: t.settings, icon: Settings }
      ]
    }
  ];

  const orgSections: NavSection[] = [
    {
      title: "Enterprise Hub",
      items: [
        { path: "/organization/dashboard", name: "Org Dashboard", icon: Building, highlight: true }
      ]
    },
    {
      title: "Brand & Threat Defense",
      items: [
        { path: "/organization/domains", name: "Authorized Domains", icon: Globe2, badge: "Brand" },
        { path: "/alerts", name: "Threat Alerts", icon: Bell }
      ]
    },
    {
      title: "SecOps Operations",
      items: [
        { path: "/organization/incidents", name: "Incident Triage", icon: ShieldAlert, badge: "Active" },
        { path: "/organization/team", name: "SecOps Team", icon: Users },
        { path: "/scan/url", name: "Threat Scanners", icon: Link2 },
        { path: "/reports", name: "Incident Reports (PDF)", icon: FileText }
      ]
    },
    {
      title: "Account & Security",
      items: [
        { path: "/security", name: "Security & Sessions", icon: ShieldCheck, badge: "NIST" },
        { path: "/profile", name: "Org Profile", icon: User },
        { path: "/settings", name: t.settings, icon: Settings }
      ]
    }
  ];

  const adminSections: NavSection[] = [
    {
      title: "SecOps Command",
      items: [
        { path: "/admin/dashboard", name: "SecOps Dashboard", icon: ShieldAlert, badge: "SecOps", highlight: true },
        { path: "/admin/users", name: "User Identity Control", icon: Users },
        { path: "/admin/organizations", name: "Organization Registry", icon: Building },
        { path: "/admin/threats", name: "Threat Triage & Review", icon: CheckSquare, badge: "Review" }
      ]
    },
    {
      title: "National Threat Radar",
      items: [
        { path: "/fusion", name: t.threatFusion, icon: Network, highlight: true, badge: "AI" },
        { path: "/heatmap", name: t.heatmap, icon: Map, badge: "Live" },
        { path: "/analytics", name: t.analytics, icon: BarChart3 },
        { path: "/threats", name: t.threatIntel, icon: Users },
        { path: "/alerts", name: t.threatAlerts, icon: Bell }
      ]
    },
    {
      title: "System & AI Governance",
      items: [
        { path: "/admin/system-health", name: "Platform System Health", icon: Activity },
        { path: "/security", name: "Security & Sessions", icon: ShieldCheck, badge: "NIST" },
        { path: "/settings", name: t.settings, icon: Settings }
      ]
    }
  ];

  const navSections = role === 'admin' 
    ? adminSections 
    : role === 'organization' 
    ? orgSections 
    : citizenSections;

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 glass-panel border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/60 transition-transform duration-300 transform lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="h-full flex flex-col pt-24 pb-6 overflow-y-auto">
        <div className="px-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.15)] font-bold'
                            : item.highlight
                            ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Defense Node Badge */}
        <div className="mt-auto px-4 pt-6">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${
                role === 'admin' ? 'bg-purple-400' : role === 'organization' ? 'bg-blue-400' : 'bg-emerald-400'
              }`}></span>
              <span className="uppercase text-[11px]">
                {role === 'admin' ? 'SecOps Authority' : role === 'organization' ? 'Enterprise Node' : 'Citizen Defense'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Node: IND-CENTRAL-01
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
