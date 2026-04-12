import { 
    Activity, 
    Key, 
    CheckCircle, 
    XCircle, 
    RefreshCw, 
    Download, 
    FolderArchive, 
    Settings, 
    MousePointer2, 
    ExternalLink, 
    Shield, 
    List, 
    Copy, 
    Info,
    ArrowRight,
    Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const ExtensionPanel = () => {
    const [copied, setCopied] = useState(false);
    const [uriCopied, setUriCopied] = useState(false);
    const [apiKey, setApiKey] = useState('phishshield-ext-key-2026');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [lastPing, setLastPing] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch extension heartbeat and scan counts
    useEffect(() => {
        let currentClientId = localStorage.getItem('phishshield_extension_id') || localStorage.getItem('ext_client_id');

        const fetchStatus = async () => {
            try {
                // Try production first if explicitly configured in .env, otherwise fallback to local
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const statusRes = await axios.get(`${apiBase}/api/extension/status?clientId=${currentClientId || ''}`);
                
                if (statusRes.data) {
                    setIsOnline(statusRes.data.is_online);
                    
                    // Broadcast the API URL to the extension so it knows where to ping
                    window.postMessage({ 
                        type: 'PHISHSHIELD_CONFIG_SYNC', 
                        apiUrl: apiBase 
                    }, '*');
                    
                    // If dashboard doesn't have a clientId but backend found one for us (fallback)
                    if (!currentClientId && statusRes.data.clientId) {
                        currentClientId = statusRes.data.clientId;
                        if (currentClientId) localStorage.setItem('phishshield_extension_id', currentClientId);
                    }
                    
                    if (statusRes.data.last_ping) {
                        const pingDate = new Date(statusRes.data.last_ping);
                        
                        // Format: DD MMM YYYY, HH:MM AM/PM
                        const datePart = pingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        const timePart = pingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        setLastPing(`${datePart}, ${timePart}`);
                    }
                }
            } catch (error) {
                console.error("Dashboard status fetch failed:", error);
                setIsOnline(false);
            }
        };

        const handleSyncMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'PHISHSHIELD_SYNC') {
                currentClientId = event.data.clientId;
                if (currentClientId) localStorage.setItem('phishshield_extension_id', currentClientId);
                fetchStatus();
            }
        };

        window.addEventListener('message', handleSyncMessage);
        window.postMessage({ type: 'PHISHSHIELD_QUERY_SYNC' }, '*');

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchStatus();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds as per requirements
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('message', handleSyncMessage);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyUri = () => {
        navigator.clipboard.writeText('chrome://extensions');
        setUriCopied(true);
        setTimeout(() => setUriCopied(false), 2000);
    };

    const handleRegenerate = () => {
        setIsRegenerating(true);
        setTimeout(() => {
            const newKey = 'shld_ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
            setApiKey(newKey);
            setIsRegenerating(false);
        }, 800);
    };

    const handleDownload = () => {
        setIsDownloading(true);
        const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/extension/download`;
        window.location.href = downloadUrl;
        setTimeout(() => setIsDownloading(false), 2000);
    };

    const installSteps = [
        { id: 1, title: 'Download Extension', desc: 'Click the green button above to download the Security Shield ZIP package.', icon: <Download className="w-5 h-5" />, color: 'bg-emerald-500' },
        { id: 2, title: 'Extract ZIP File', desc: 'Locate the downloaded ZIP and extract all files to a new folder on your PC.', icon: <FolderArchive className="w-5 h-5" />, color: 'bg-blue-500' },
        { id: 3, title: 'Open Extensions', desc: 'Navigate to chrome://extensions in your browser.', icon: <ExternalLink className="w-5 h-5" />, color: 'bg-blue-500', isUri: true },
        { id: 4, title: 'Developer Mode', desc: 'Enable the "Developer mode" toggle switch in the top right corner.', icon: <Settings className="w-5 h-5" />, color: 'bg-blue-500', isDeveloper: true },
        { id: 5, title: 'Load Unpacked', desc: 'Click the "Load unpacked" button that appears in the top left toolbar.', icon: <ArrowRight className="w-5 h-5" />, color: 'bg-blue-500' },
        { id: 6, title: 'Select Folder', desc: 'Browse and select the folder you extracted in Step 2.', icon: <MousePointer2 className="w-5 h-5" />, color: 'bg-blue-500' },
        { id: 7, title: 'Ready to Use', desc: 'The extension is now installed! Pin it to your toolbar for easy access.', icon: <CheckCircle className="w-5 h-5" />, color: 'bg-green-500' },
    ];

    const usageFeatures = [
        { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: 'Real-time Protection', desc: 'Open any website and the extension automatically scans URLs for phishing threats.' },
        { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Instant Detection', desc: 'Threats are detected instantly using our AI model and blocked before you interact.' },
        { icon: <List className="w-5 h-5 text-cyan-400" />, title: 'Detailed Logs', desc: 'View all scan results and history directly in the Threat Logs section of this dashboard.' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Stats and Key Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600/60 transition-colors duration-300">
                    <h3 className="text-xl text-slate-200 mb-4 font-light flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        Extension Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 group hover:border-slate-600 transition-colors">
                            <span className="text-slate-400">Connection State</span>
                            <span className={`flex items-center gap-2 text-sm font-medium transition-colors duration-500 ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                {isOnline ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400">Last Ping</span>
                            <span className="text-slate-300 text-sm font-mono flex items-center gap-2">
                                {isOnline && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                                {lastPing || 'Never'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400">System Status</span>
                            <span className={`text-sm font-medium ${isOnline ? 'text-cyan-400' : 'text-slate-500'}`}>
                                {isOnline ? 'OPTIMAL' : 'NOT DETECTED'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-xl hover:border-slate-600/60 transition-colors duration-300">
                    <h3 className="text-xl text-slate-200 mb-4 font-light flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-400" />
                        API Key Management
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 font-light leading-relaxed">Use this key in the extension settings to securely link it to your dashboard.</p>

                    <div className="relative group">
                        <input
                            type="text"
                            readOnly
                            value={apiKey}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500/50 transition-all group-hover:border-slate-600"
                        />
                        <button
                            onClick={handleCopy}
                            className={`absolute right-2 top-2 px-3 py-1 rounded text-xs font-semibold transition-all duration-300 ${copied ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent active:scale-95'
                                }`}
                        >
                            {copied ? 'COPIED!' : 'COPY'}
                        </button>
                    </div>

                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="mt-6 w-full py-3 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-all text-sm border border-slate-700 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-cyan-400' : ''}`} />
                        {isRegenerating ? 'GENERATING NEW KEY...' : 'REGENERATE KEY'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-3 group overflow-hidden relative active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Download className={`w-5 h-5 relative z-10 ${isDownloading ? 'animate-bounce' : 'group-hover:translate-y-1 transition-transform'}`} />
                            <span className="relative z-10 uppercase tracking-wide text-sm">
                                {isDownloading ? 'PREPARING BUNDLE...' : 'DOWNLOAD SECURITY SHIELD (ZIP)'}
                            </span>
                        </button>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-2 mt-4 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] text-emerald-400 uppercase tracking-[0.2em] font-bold">Ready for Instant Installation</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instruction Section */}
            <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700/40 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-2xl text-white font-medium mb-2">How to Install Extension</h2>
                        <p className="text-slate-400 font-light">Follow these 7 simple steps to get protected in minutes.</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center gap-3">
                        <Info className="w-5 h-5 text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-200/80 leading-relaxed font-light">
                            Developer Mode <strong>must be enabled</strong> in Chrome to install manually.
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {installSteps.map((step, idx) => (
                        <div key={step.id} className="relative group p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:-translate-y-1">
                            <div className={`w-10 h-10 ${step.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-950/40 group-hover:scale-110 transition-transform`}>
                                {step.icon}
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400">
                                    {step.id}
                                </span>
                                <h4 className="text-slate-200 font-medium">{step.title}</h4>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-light">{step.desc}</p>
                            
                            {step.isUri && (
                                <button 
                                    onClick={handleCopyUri}
                                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded-lg flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                                >
                                    <Copy className="w-3 h-3" />
                                    {uriCopied ? 'URI COPIED!' : 'COPY URI'}
                                </button>
                            )}
                            
                            {idx < installSteps.length - 1 && (
                                <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-hover:translate-x-1 transition-transform" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Success Banner */}
                <div className="mt-10 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm text-emerald-100 font-medium">Almost there!</p>
                        <p className="text-xs text-emerald-400/80">Once installed and linked via API Key, your status will instantly update to <span className="text-emerald-400 font-bold">ONLINE</span> above.</p>
                    </div>
                </div>
            </div>

            {/* Usage Section */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/60 backdrop-blur-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 -mr-10 -mt-10 bg-indigo-500/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <h2 className="text-2xl text-white font-medium mb-8">How to Use the Extension</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {usageFeatures.map((f, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 group-hover:scale-110 transition-transform shrink-0 h-fit">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="text-slate-200 font-medium mb-1">{f.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-light">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
