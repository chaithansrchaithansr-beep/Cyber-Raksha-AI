import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OrgTeamMember } from '../types';
import { 
  Users, Plus, Trash2, Mail, ShieldCheck, CheckCircle2, 
  AlertTriangle, RefreshCw, UserCheck
} from 'lucide-react';

export const OrgTeamPage: React.FC = () => {
  const [team, setTeam] = useState<OrgTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SecOps Analyst');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTeam = async () => {
    try {
      const data = await api.org.getTeam();
      setTeam(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.org.addTeamMember({
        name: name.trim(),
        email: email.trim(),
        role: role
      });
      setSuccess(`Invited ${name.trim()} to the SecOps team.`);
      setName('');
      setEmail('');
      setShowModal(false);
      await loadTeam();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to add team member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId: number, memberName: string) => {
    if (!confirm(`Revoke SecOps portal access for ${memberName}?`)) return;

    try {
      await api.org.removeTeamMember(memberId);
      setSuccess(`Removed ${memberName} from team.`);
      await loadTeam();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove member.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Organization Administration</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">SecOps Team & Access Control</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Delegate security operations responsibilities, manage analyst permissions, and oversee authorized triage users.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Team Members List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          Authorized Analysts & Administrators ({team.length})
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-cyan-400">
            LOADING TEAM ROSTER...
          </div>
        ) : team.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No additional team members added. You are currently the primary admin.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {team.map((member) => (
              <div key={member.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{member.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                      {member.role}
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{member.email}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500">
                    Joined: {new Date(member.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleRemove(member.id, member.name)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Revoke access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-md w-full space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Invite Team Member
            </h2>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="SecOps Lead">SecOps Lead (Full Control)</option>
                  <option value="SecOps Analyst">SecOps Analyst (Triage & Investigate)</option>
                  <option value="Compliance Officer">Compliance Officer (Read & Export)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5"
                >
                  {submitting ? 'Sending Invitation...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
