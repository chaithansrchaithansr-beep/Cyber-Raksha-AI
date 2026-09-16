import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { ThreatBadge } from '../components/ThreatBadge';
import { FileText, Download, Code, ShieldCheck, Check, Copy, ArrowRight, ExternalLink } from 'lucide-react';

export const IncidentReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ScanResult[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.scans.getHistory();
        setReports(data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const copyHash = (hash: string, id: number) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJson = async (scanId: number) => {
    try {
      const jsonData = await api.scans.getJson(scanId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Cyber_Raksha_Report_${scanId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Failed to export JSON', e);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          <span>Module 14 • Automated Incident Response Documentation</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Security Incident Reports</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Cryptographically signed incident documentation for law enforcement filing, enterprise post-mortems, and CERT-In escalation.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No reports generated yet. Perform a scan to generate an incident report.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-extrabold bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded border border-cyan-500/30">
                      CR-INC-2026-{String(r.id).padStart(5, '0')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <ThreatBadge level={r.classification} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Target Preview:</span>
                    <span className="text-slate-200 font-mono truncate block">{r.input_preview}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] font-bold block">Diagnostic Evaluation:</span>
                    <span className="text-slate-300 truncate block">{r.ai_explanation}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 truncate max-w-sm">
                    <span>SHA-256: {r.report_integrity_hash.slice(0, 16)}...</span>
                    <button
                      onClick={() => copyHash(r.report_integrity_hash, r.id)}
                      className="text-slate-400 hover:text-white"
                      title="Copy cryptographic integrity hash"
                    >
                      {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportJson(r.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Code className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Export JSON</span>
                    </button>

                    <a
                      href={api.scans.getPdfDownloadUrl(r.id)}
                      download
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
