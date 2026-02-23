import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

export const UrlScanner = () => {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        if (!url) return;
        setIsScanning(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/predict_url`, { url });
            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResult(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to connect to scanner API. Is the backend running?');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500 box-border">
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl shadow-2xl">
                <h3 className="text-xl text-slate-200 mb-6 font-light">Deep URL Analysis</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Enter URL to securely scan..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-6 py-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm shadow-inner"
                    />
                    <button
                        onClick={handleScan}
                        disabled={isScanning || !url}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
                    >
                        {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> SCANNING...</> : 'INITIATE SCAN'}
                    </button>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Analysis Result */}
                {result && (
                    <div className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-start gap-8 animate-in fade-in duration-500">
                        <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center relative inner-shadow shrink-0 ${result.result === 'Phishing' ? 'border-red-500/20' : 'border-green-500/20'}`}>
                            <span className={`text-3xl font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] ${result.result === 'Phishing' ? 'text-red-500' : 'text-green-500'}`}>
                                {result.risk_score !== undefined ? `${(result.risk_score * 100).toFixed(1)}%` : (result.result === 'Phishing' ? '99%' : '1%')}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Risk Match</span>
                            <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${result.result === 'Phishing' ? 'border-red-500' : 'border-green-500'}`} style={{ animationDuration: '3s' }}></div>
                        </div>

                        <div className="flex-1 w-full">
                            <h4 className={`font-medium mb-3 flex items-center gap-2 ${result.result === 'Phishing' ? 'text-red-400' : 'text-green-400'}`}>
                                {result.result === 'Phishing' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                {result.result === 'Legitimate' ? 'Safe URL Detected' : 'Phishing URL Detected'}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                {result.features && Object.entries(result.features).slice(0, 9).map(([key, val]: any) => (
                                    <div key={key} className={`bg-slate-900/50 p-3 rounded-lg border border-slate-700 border-l-2 ${val ? (result.result === 'Phishing' ? 'border-l-red-500' : 'border-l-yellow-500') : 'border-l-slate-600'}`}>
                                        <span className="text-xs text-slate-500 block mb-1">{key}</span>
                                        <span className="text-sm text-slate-300 font-mono">{String(val)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
