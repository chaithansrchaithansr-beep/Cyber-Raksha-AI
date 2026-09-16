import React from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { PublicFooter } from '../components/PublicFooter';
import { LiveAlertToast } from '../components/LiveAlertToast';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col cyber-grid selection:bg-cyan-500 selection:text-black">
      <PublicNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>
      <PublicFooter />
      <LiveAlertToast />
    </div>
  );
};
