import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OrgIncidentItem } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  ShieldAlert, Plus, Download, CheckCircle2, AlertTriangle, 
  Clock, RefreshCw, Filter, FileText, Code, Check
} from 'lucide-react';

export const OrgIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<OrgIncidentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadIncidents = async () => {
    try {
      const data = await api.org.getIncidents();
      setIncidents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.org.createIncident({
        title: title.trim(),
        description: description.trim(),
        severity: severity
      });
      setSuccess('Incident logged successfully.');
      setTitle('');
      setDescription('');
      setShowModal(false);
      await loadIncidents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to log incident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (incidentId: number, newStatus: string) => {
    try {
      await api.org.updateIncident(incidentId, { status: newStatus });
      setSuccess(`Incident updated to ${newStatus}`);
      await loadIncidents();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    }
  };

  const handleExportJson = async (incidentId: number) => {
    try {
      const data = await api.org.exportIncident(incidentId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CR_ORG_INCIDENT_${incidentId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      setError('Failed to export incident data.');
    }
  };

  const filteredIncidents = statusFilter === 'ALL'
    ? incidents
    : incidents.filter(i => i.status.toUpperCase() === statusFilter.toUpperCase());

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>SecOps Incident Command</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Enterprise Security Incidents</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track, investigate, contain, and document security events for corporate compliance and CERT-In disclosures.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Security Incident</span>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? 'bg-cyan-500 text-black shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center text-xs font-mono text-cyan-400">
            LOADING INCIDENT QUEUE...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">No security incidents found in this category.</p>
            <p className="text-[11px] text-slate-500">Log new incidents to track containment and investigation steps.</p>
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div key={inc.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold bg-slate-800 text-cyan-400 px-2.5 py-1 rounded border border-slate-700">
                    INC-2026-{String(inc.id).padStart(4, '0')}
                  </span>
                  <h3 className="text-base font-bold text-white">{inc.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <ThreatBadge level={inc.severity} />
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                    inc.status === 'RESOLVED' || inc.status === 'CLOSED'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : inc.status === 'CONTAINED'
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {inc.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{inc.description}</p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">
                  Logged: {new Date(inc.created_at).toLocaleString()}
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Dropdown */}
                  <select
                    value={inc.status}
                    onChange={(e) => handleStatusChange(inc.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="CONTAINED">CONTAINED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  <button
                    onClick={() => handleExportJson(inc.id)}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Code className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-xl w-full space-y-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              Log Corporate Security Incident
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unauthorized credential stuffing attempt on employee SSO portal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL (System Compromise / Data Breach)</option>
                  <option value="HIGH">HIGH (Targeted Phishing / Impersonation)</option>
                  <option value="MODERATE">MODERATE (Suspicious Probing / Scan)</option>
                  <option value="LOW">LOW (Informational Incident)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Incident Description & Evidence</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical scope, affected IP addresses, domains, and actions taken..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
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
                  {submitting ? 'Saving...' : 'Record Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
