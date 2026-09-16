import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ScanResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ThreatBadge } from '../components/ThreatBadge';
import { 
  QrCode, ShieldAlert, ArrowRight, Download, CheckCircle2, 
  AlertTriangle, RefreshCw, UploadCloud, FileImage, Cpu, Check, Copy
} from 'lucide-react';

export const QrScannerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
  const [qrText, setQrText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleQrs = [
    {
      label: "💸 Malicious UPI Debit Intent",
      val: "upi://pay?pa=scammer99@ybl&pn=LotteryCashback&am=4999&cu=INR"
    },
    {
      label: "🚨 Phishing Website QR Redirect",
      val: "http://sbi-rewards-yono.xyz/qr-redeem.php"
    },
    {
      label: "✅ Legitimate Merchant UPI QR",
      val: "upi://pay?pa=retailstore@icici&pn=Supermarket&cu=INR"
    }
  ];

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }
    setFile(selectedFile);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResult(null);

    if (activeTab === 'upload') {
      if (!file) {
        setError("Please upload an image file containing a QR code.");
        return;
      }
      setLoading(true);
      try {
        const res = await api.scans.scanQrImage(file);
        setResult(res);
      } catch (err: any) {
        setError(err.message || 'QR image decoding failed. Ensure the image is clear and contains a valid QR code.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!qrText.trim()) return;
      setLoading(true);
      try {
        const res = await api.scans.scanQr({ extracted_data: qrText.trim() });
        setResult(res);
      } catch (err: any) {
        setError(err.message || 'QR text analysis failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <QrCode className="w-4 h-4" />
          <span>Module 06 • QR Optical & Protocol Destination Analyzer</span>
        </div>
        <h1 className="text-3xl font-black text-white mt-1">QR Code Security Scanner</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Decodes real QR code images using computer vision, detecting fraudulent UPI debit parameters and malicious redirection URLs before you scan with your phone.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload QR Image</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Paste QR Content</span>
        </button>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
        {activeTab === 'upload' ? (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                file
                  ? 'border-amber-500/50 bg-amber-500/5'
                  : 'border-slate-800 hover:border-amber-500/30 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              {filePreview ? (
                <div className="space-y-3 flex flex-col items-center">
                  <img
                    src={filePreview}
                    alt="Uploaded QR Code"
                    className="max-h-48 max-w-xs object-contain rounded-xl border border-slate-700 shadow-lg"
                  />
                  <p className="text-xs font-mono text-amber-300 font-bold">{file?.name}</p>
                  <span className="text-[11px] text-slate-400">Click or drag a new image to replace</span>
                </div>
              ) : (
                <div className="space-y-3 flex flex-col items-center justify-center py-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <FileImage className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Drag & drop QR code image here</p>
                    <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WEBP (Max 10MB)</p>
                  </div>
                  <span className="text-xs px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    Browse Local File
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleScan()}
                disabled={loading || !file}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Decoding & Auditing QR Image...</span>
                  </>
                ) : (
                  <>
                    <span>Audit QR Image with pyzbar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                QR Code Raw Payload / Decoded Destination Data
              </label>
              <input
                type="text"
                required
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Paste decoded QR content (e.g. upi://pay?pa=... or https://...)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading || !qrText.trim()}
                className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing QR Code...</span>
                  </>
                ) : (
                  <>
                    <span>Audit QR Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase text-slate-500">Test QR Presets:</span>
              {sampleQrs.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQrText(s.val)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition-all font-mono"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </form>
        )}
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Decoded Payload</span>
                {result.analysis_method && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                    Engine: {result.analysis_method}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-white mt-1 break-all font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {result.input_preview}
              </h3>
            </div>
            <ThreatBadge level={result.classification} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <RiskGauge score={result.risk_score} size={160} />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  QR Payload Diagnostic
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_explanation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detected Security Indicators</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.detected_indicators.map((ind, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">⚠</span>
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Safety Recommendation</h4>
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
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download Incident Report (PDF)</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
