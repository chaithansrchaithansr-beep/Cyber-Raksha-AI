import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { 
  Users, Search, ShieldCheck, UserX, UserCheck, 
  CheckCircle2, AlertTriangle, RefreshCw, Filter, Shield
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await api.admin.getUsers({
        q: searchQuery || undefined,
        role: roleFilter !== 'ALL' ? roleFilter.toLowerCase() : undefined
      });
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggle = async (userId: number, currentStatus: boolean, userName: string) => {
    try {
      const res = await api.admin.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: res.is_active } : u));
      setFeedback(`User ${userName} is now ${res.is_active ? 'ACTIVE' : 'DEACTIVATED'}.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback('Failed to update user status.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>SecOps Access Governance</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">User Identity & Access Control</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          National identity directory, role segregation, active session controls, and account status management.
        </p>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or organization..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'CITIZEN', 'ORGANIZATION', 'ADMIN'].map((rf) => (
            <button
              key={rf}
              onClick={() => setRoleFilter(rf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                roleFilter === rf
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Active User Records ({users.length})
          </span>
          <span className="text-xs text-slate-500 font-mono">Real DB Query</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-cyan-400">
            LOADING IDENTITIES...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No user accounts found matching the query criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <div key={u.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{u.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      u.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : u.role === 'organization'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {u.role}
                    </span>
                    {u.organization && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({u.organization})
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 font-mono text-[11px]">{u.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`text-[10px] font-bold block ${u.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                      {u.is_active ? 'ACCOUNT ACTIVE' : 'SUSPENDED'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggle(u.id, u.is_active, u.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      u.is_active
                        ? 'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {u.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
