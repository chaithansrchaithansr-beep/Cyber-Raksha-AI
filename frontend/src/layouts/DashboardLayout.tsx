import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { LiveAlertToast } from '../components/LiveAlertToast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col cyber-grid">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex w-full">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 w-full min-w-0 flex flex-col">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
            {children}
          </div>

          <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 CYBER RAKSHA AI. National Cyber Threat Intelligence & Digital Scam Protection Platform.</p>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  System Status: Normal
                </span>
                <span>•</span>
                <span>Emergency Cyber Helpline: <strong>1930</strong></span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <LiveAlertToast />
    </div>
  );
};
