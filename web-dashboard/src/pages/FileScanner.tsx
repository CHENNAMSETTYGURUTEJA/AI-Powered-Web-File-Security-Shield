import { UploadCloud, File as FileIcon, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';

export const FileScanner = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleScan = async () => {
        if (!file) return;
        setIsScanning(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://127.0.0.1:8000/predict_file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setResult(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to connect to scanner API.');
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl shadow-2xl text-center">
                <h3 className="text-xl text-slate-200 mb-2 font-light">Static & Dynamic File Sandbox</h3>
                <p className="text-sm text-slate-400 mb-8">Upload suspicious files to analyze for malware vectors.</p>

                {/* Upload Area */}
                <div
                    className="border-2 border-dashed border-slate-600 rounded-xl p-16 hover:border-cyan-500 hover:bg-slate-800/50 transition-all cursor-pointer group flex flex-col items-center justify-center relative shadow-inner"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {!file ? (
                        <>
                            <UploadCloud className="w-16 h-16 text-slate-500 group-hover:text-cyan-400 mb-4 transition-colors" />
                            <p className="text-slate-300 font-medium text-lg">Drag & drop your file here</p>
                            <p className="text-slate-400 mt-1">or click to browse from your computer</p>
                            <p className="text-xs text-slate-500 mt-4 font-mono">Max size: 50MB. Supported: EXE, DLL, PDF, DOCX, etc.</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center">
                            <FileIcon className="w-16 h-16 text-cyan-400 mb-4" />
                            <p className="text-slate-200 font-medium text-lg break-all">{file.name}</p>
                            <p className="text-sm text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                                className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1 rounded-full outline-none"
                            >
                                Remove File
                            </button>
                        </div>
                    )}
                </div>

                {/* Scan Button */}
                {file && !result && (
                    <div className="mt-8">
                        <button
                            onClick={handleScan}
                            disabled={isScanning}
                            className={`px-8 py-3 rounded-xl font-medium shadow-lg transition-all ${isScanning
                                    ? 'bg-indigo-600/50 text-indigo-300 cursor-not-allowed hidden'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 hover:shadow-cyan-500/25'
                                }`}
                        >
                            {isScanning ? 'ANALYZING FILE...' : 'INITIATE ANALYSIS'}
                        </button>

                        {isScanning && (
                            <div className="flex flex-col items-center justify-center mt-4">
                                <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="text-cyan-400 mt-4 animate-pulse uppercase tracking-widest text-sm font-semibold">Scanning File Hash & Structure...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Error Box */}
                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flexitems-center justify-center">
                        {error}
                    </div>
                )}

                {/* Analysis Result */}
                {result && (
                    <div className="mt-8 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center md:items-start gap-8 animate-in fade-in duration-500 text-left">
                        <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center relative inner-shadow shrink-0 ${result.result === 'Malicious' ? 'border-red-500/20' : 'border-green-500/20'}`}>
                            <span className={`text-4xl font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] ${result.result === 'Malicious' ? 'text-red-500' : 'text-green-500'}`}>
                                {result.risk_score ? `${(result.risk_score * 100).toFixed(1)}%` : (result.result === 'Malicious' ? '99%' : '1%')}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 text-center leading-tight">Risk<br />Match</span>
                            <div className={`absolute inset-0 border-4 rounded-full border-t-transparent animate-spin ${result.result === 'Malicious' ? 'border-red-500' : 'border-green-500'}`} style={{ animationDuration: '3s' }}></div>
                        </div>

                        <div className="flex-1 w-full">
                            <h4 className={`font-semibold text-xl mb-4 flex items-center gap-2 ${result.result === 'Malicious' ? 'text-red-400' : 'text-green-400'}`}>
                                {result.result === 'Malicious' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                                {result.result === 'Legitimate' ? 'Safe File Detected' : 'Malicious File Detected'}
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">File Name</span>
                                    <span className="text-sm text-slate-300 font-mono truncate block" title={result.filename}>{result.filename}</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">File Size</span>
                                    <span className="text-sm text-slate-300 font-mono">{(result.size / 1024).toFixed(2)} KB</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 md:col-span-2">
                                    <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">SHA-256 Hash Signature</span>
                                    <span className="text-xs text-slate-300 font-mono break-all">{result.hash}</span>
                                </div>
                                <div className={`bg-slate-900/50 p-4 rounded-xl border md:col-span-2 ${result.result === 'Malicious' ? 'border-red-500/30' : 'border-slate-700'}`}>
                                    <span className="text-xs text-slate-500 block mb-1 uppercase tracking-wider">Threat Intelligence</span>
                                    <span className="text-sm text-slate-300">{result.details}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
