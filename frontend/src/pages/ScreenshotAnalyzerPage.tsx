import React, { useState } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { Camera, Upload, ShieldAlert, Download, CheckCircle2, AlertTriangle, RefreshCw, FileImage } from 'lucide-react';

export const ScreenshotAnalyzerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scans.scanScreenshot(file);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Image analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const loadSimulatedFakeReceipt = async () => {
    try {
      // 300x150 valid PNG binary representation
      const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWAQMAAABx81jHAAAABlBMVEUAAAD///+l2Z/dAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAQUlEQVRYhe3BMQEAAADCoPVPbQhfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvBh/cAABh68HggAAAABJRU5ErkJggg==";
      const res = await fetch(b64);
      const blob = await res.blob();
      const dummyFile = new File([blob], "fake_payment_receipt_phonepe.png", { type: "image/png" });
      setFile(dummyFile);
      setPreview("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'><rect width='300' height='200' fill='%230b132b'/><text x='50%25' y='45%25' fill='%2310b981' font-size='16' font-family='sans-serif' text-anchor='middle'>Payment Successful</text><text x='50%25' y='65%25' fill='%23ffffff' font-size='20' font-weight='bold' font-family='sans-serif' text-anchor='middle'>₹ 15,000.00</text></svg>");
    } catch (_) {}
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <Camera className="w-4 h-4" />
          <span>Module 05 • Computer Vision & OCR Heuristics</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">Screenshot-Based Scam Detection</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Detects manipulated payment receipts, synthetic UPI transaction confirmations, and social engineering text embedded in images.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <form onSubmit={handleScan} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700/80 hover:border-purple-500/50 rounded-2xl p-6 text-center transition-all bg-slate-900/40">
            <input
              type="file"
              id="file-upload"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-white">
                {file ? file.name : "Click to browse or drop payment screenshot / chat capture"}
              </p>
              <p className="text-[11px] text-slate-500">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
            </label>

            {preview && (
              <div className="mt-4 flex justify-center">
                <img src={preview} alt="Preview" className="max-h-40 rounded-xl border border-slate-700 object-contain shadow-lg" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={loadSimulatedFakeReceipt}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline"
            >
              Load Simulated Fake UPI Receipt Sample
            </button>

            <button
              type="submit"
              disabled={loading || !file}
              className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Image & OCR...</span>
                </>
              ) : (
                <>
                  <span>Analyze Screenshot</span>
                  <Camera className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">OCR & Visual Assessment</span>
              <h3 className="text-xl font-black text-white mt-1">{result.input_preview}</h3>
            </div>
            <ThreatBadge level={result.classification} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <RiskGauge score={result.risk_score} size={160} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Visual Analysis Findings
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Computer Vision Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.detected_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <span className="text-red-400 font-bold">⚠</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Citizen Advice</h4>
            <ul className="space-y-1">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-xs text-amber-100 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <a
              href={api.scans.getPdfDownloadUrl(result.id)}
              download
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Download Incident Report (PDF)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
