import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface AccessDeniedProps {
  requiredRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'organization') return '/org/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border-2 border-red-500/40 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
            SECURITY EXCEPTION 403
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">ACCESS DENIED</h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            You do not have permission to access this page. This perimeter is restricted to authorized credentials.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 text-left font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Your Current Role:</span>
            <span className="text-amber-400 uppercase font-bold">{user?.role || 'Guest'}</span>
          </div>
          {requiredRole && (
            <div className="flex justify-between text-slate-400">
              <span>Required Role:</span>
              <span className="text-red-400 uppercase font-bold">{requiredRole}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>Security Policy:</span>
            <span>NIST-RBAC-ZERO-TRUST</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            to={getDashboardPath()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
