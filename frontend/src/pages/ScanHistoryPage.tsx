import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { History, Search, Download, Filter, ExternalLink } from 'lucide-react';

export const ScanHistoryPage: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.scans.getHistory();
        setScans(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const filtered = scans.filter(s => {
    const matchesSearch = (s.input_preview || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.scan_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || s.scan_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <History className="w-4 h-4" />
          <span>Audit & Telemetry Logs</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Scan History</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Historical record of all performed threat assessments, cryptographic hashes, and downloadable incident files.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by URL, keyword, or hash..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Vector Types</option>
            <option value="url">URL Scans</option>
            <option value="message">Messages (SMS/WA)</option>
            <option value="email">Emails</option>
            <option value="website">Websites</option>
            <option value="screenshot">Screenshots (OCR)</option>
            <option value="qr">QR Codes</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="p-4">Vector</th>
                <th className="p-4">Input Preview</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Confidence</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">No matching scans found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {s.scan_type}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate font-mono text-slate-300">
                      {s.input_preview}
                    </td>
                    <td className="p-4">
                      <ThreatBadge level={s.classification} />
                    </td>
                    <td className="p-4 font-bold text-white">
                      {s.risk_score}/100
                    </td>
                    <td className="p-4 text-cyan-400 font-mono">
                      {s.confidence}%
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] font-mono">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={api.scans.getPdfDownloadUrl(s.id)}
                        download
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-flex items-center gap-1 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
