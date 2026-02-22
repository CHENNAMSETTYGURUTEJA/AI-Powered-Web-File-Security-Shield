import { Activity, Key, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const ExtensionPanel = () => {
    const [copied, setCopied] = useState(false);
    const [apiKey, setApiKey] = useState('phishshield-ext-key-2026');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [lastPing, setLastPing] = useState<string | null>(null);
    const [totalScans, setTotalScans] = useState(0);

    // Fetch extension heartbeat and scan counts
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Get Heartbeat
                const statusRes = await axios.get('http://localhost:8000/api/extension-status');
                if (statusRes.data) {
                    setIsOnline(statusRes.data.is_online);

                    if (statusRes.data.last_ping) {
                        const pingDate = new Date(statusRes.data.last_ping);
                        setLastPing(pingDate.toLocaleTimeString());
                    }
                }

                // Get Scan Count
                const logsRes = await axios.get('http://localhost:8000/logs');
                if (logsRes.data && logsRes.data.logs) {
                    const extScans = logsRes.data.logs.filter((log: any) => log.type === 'EXTENSION');
                    setTotalScans(extScans.length);
                }
            } catch (error) {
                console.error("Failed to fetch extension status", error);
                setIsOnline(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);
        setTimeout(() => {
            // In a real app, this would hit a backend endpoint to invalidate the old key
            const newKey = 'shld_ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
            setApiKey(newKey);
            setIsRegenerating(false);
        }, 800);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl">
                <h3 className="text-xl text-slate-200 mb-4 font-light flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Extension Status
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400">Connection State</span>
                        {isOnline ? (
                            <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" /> ACTIVE & SYNCED
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-red-400 text-sm font-medium">
                                <XCircle className="w-4 h-4" /> OFFLINE
                            </span>
                        )}
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400">Last Ping</span>
                        <span className="text-slate-300 text-sm font-mono flex items-center gap-2">
                            {isOnline && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                            {lastPing || 'Never'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        <span className="text-slate-400">Total Scans Received</span>
                        <span className="text-slate-300 text-sm font-mono">{totalScans.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl">
                <h3 className="text-xl text-slate-200 mb-4 font-light flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-400" />
                    API Key Management
                </h3>
                <p className="text-sm text-slate-400 mb-6">Use this key in the browser extension settings to link it to your dashboard account.</p>

                <div className="relative">
                    <input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-slate-300 font-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button
                        onClick={handleCopy}
                        className={`absolute right-2 top-2 px-3 py-1 rounded text-xs font-medium transition-all duration-300 ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-700 hover:bg-slate-600 text-white border border-transparent'
                            }`}
                    >
                        {copied ? 'COPIED!' : 'COPY'}
                    </button>
                </div>

                <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="mt-6 w-full py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-all text-sm border border-slate-600 flex items-center justify-center gap-2"
                >
                    <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-cyan-400' : ''}`} />
                    {isRegenerating ? 'GENERATING...' : 'REGENERATE KEY'}
                </button>
            </div>
        </div>
    );
};
