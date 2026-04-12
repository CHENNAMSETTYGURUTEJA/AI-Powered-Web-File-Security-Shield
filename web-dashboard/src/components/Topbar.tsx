import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';

export const Topbar = () => {
    const location = useLocation();

    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case '/': return 'Dashboard';
            case '/url-scanner': return 'URL Scanner';
            case '/file-scanner': return 'File Sandbox';
            case '/logs': return 'Threat Logs';
            case '/extension': return 'Extension Panel';
            case '/analytics': return 'Model Analytics';
            default: return 'Security Terminal';
        }
    };

    return (
        <header className="h-20 border-b border-slate-800/60 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
            <h2 className="text-2xl font-light text-slate-100">
                {getPageTitle(location.pathname)}
            </h2>
            <div className="flex items-center gap-4">
                <button className="px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-500 transition-colors text-sm">
                    System Status: <span className="text-cyan-400 font-mono">OPTIMAL</span>
                </button>
                <div className="w-10 h-10 rounded-full border border-slate-600 bg-slate-800 flex items-center justify-center text-slate-300 shadow-[0_0_15px_-5px_rgba(6,182,212,0.4)] relative">
                    <User className="w-5 h-5" />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
            </div>
        </header>
    );
};
