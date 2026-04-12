import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Link, FileSearch, ShieldAlert, Settings, Activity } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'URL Scanner', path: '/url-scanner', icon: Link },
    { name: 'File Sandbox', path: '/file-scanner', icon: FileSearch },
    { name: 'Threat Logs', path: '/logs', icon: ShieldAlert },
    { name: 'Extension Panel', path: '/extension', icon: Settings },
    { name: 'Model Analytics', path: '/analytics', icon: Activity },
];

export const Sidebar = () => {
    return (
        <aside className="w-64 border-r border-slate-800/60 bg-slate-900/50 backdrop-blur-xl flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                    SHIELD<span className="text-slate-100">AI</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Security Terminal</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => clsx(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300",
                                isActive
                                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Extension Status */}
            <div className="p-4 m-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Extension</span>
                    <span className="flex items-center gap-2 text-xs text-green-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                        SYNCED
                    </span>
                </div>
            </div>
        </aside>
    );
};
