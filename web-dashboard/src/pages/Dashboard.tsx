import { Link } from 'react-router-dom';
import { ShieldAlert, FileSearch, ShieldCheck, Zap, Lock, Globe, Layers, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
    return (
        <div className="space-y-16 animate-in fade-in duration-700 pb-16">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 px-4 md:px-8 flex flex-col items-center text-center overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-md relative z-10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    AI-Powered Threat Detection Active
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-slate-400">
                    AI-Powered Web & File <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Security Shield</span>
                </h1>

                <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl font-light leading-relaxed relative z-10">
                    Protect your digital workspace with cutting-edge Machine Learning.
                    Instantly analyze URLs for phishing and scan files for hidden malware with enterprise-grade accuracy.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
                    <Link to="/url-scanner" className="group flex items-center justify-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-all duration-300 shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.6)] hover:-translate-y-1">
                        <Globe className="w-5 h-5" />
                        Start URL Scan
                    </Link>
                    <Link to="/file-scanner" className="group flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                        <FileSearch className="w-5 h-5 text-indigo-400" />
                        Upload File to Sandbox
                    </Link>
                </div>
            </section>

            {/* Features Highlights */}
            <section className="px-4 md:px-8 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Comprehensive Defense</h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-cyan-500 to-transparent mx-auto mt-4 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md group hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">URL Scanning</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Deep analysis of URL structures, domain reputation, and page content to accurately catch zero-day phishing attempts.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md group hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <FileSearch className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">File Sandbox</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Securely analyze suspicious executables and documents. We look for malicious signatures and heuristics.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md group hover:bg-slate-800/50 hover:border-blue-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Zap className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Real-Time Protection</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Lightning-fast XGBoost models provide split-second predictions, keeping you safe without slowing you down.
                        </p>
                    </div>

                    {/* Card 4 */}
                    <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md group hover:bg-slate-800/50 hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <Layers className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">Browser Extension</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Take our protection directly into your browser. Automatically block threats before they load or download.
                        </p>
                    </div>
                </div>
            </section>

            {/* Architecture / Workflow */}
            <section className="px-4 md:px-8 py-12 relative z-10">
                <div className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden border-t-cyan-500/30 shadow-[inset_0_1px_0_0_rgba(6,182,212,0.1)]">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-6">How The Shield Works</h2>
                            <p className="text-slate-400 mb-8 font-light leading-relaxed">
                                Our architecture relies on a highly trained XGBoost model operating behind a secure FastAPI backend. When an asset is analyzed, we extract over 22 specific features.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-cyan-400 text-sm font-bold">1</div>
                                    <div>
                                        <h4 className="text-slate-200 font-medium mb-1">Feature Extraction</h4>
                                        <p className="text-sm text-slate-500">Parsing syntax, fetching domains, and resolving redirects to create a structured vector.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-indigo-400 text-sm font-bold">2</div>
                                    <div>
                                        <h4 className="text-slate-200 font-medium mb-1">ML Inference</h4>
                                        <p className="text-sm text-slate-500">Passing the scaled vector through our XGBoost model, calculating a risk probability score.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-emerald-400 text-sm font-bold">3</div>
                                    <div>
                                        <h4 className="text-slate-200 font-medium mb-1">Action & Logging</h4>
                                        <p className="text-sm text-slate-500">Returning the precise confidence score to the user and securely logging it for forensic review.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abstract visual */}
                        <div className="flex justify-center md:justify-end">
                            <div className="relative w-full max-w-sm aspect-square rounded-full border border-slate-800 flex items-center justify-center group">
                                <div className="absolute inset-4 rounded-full border border-dashed border-slate-700 animate-[spin_60s_linear_infinite]"></div>
                                <div className="absolute inset-12 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors animate-[spin_40s_linear_infinite_reverse]"></div>
                                <div className="absolute inset-24 rounded-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(6,182,212,0.2)]">
                                    <ShieldCheck className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages and Footer */}
            <section className="px-4 md:px-8 border-t border-slate-800/50 pt-16 mt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
                    <div>
                        <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                            <Lock className="w-5 h-5 text-cyan-500" /> Serverless Ready
                        </div>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li>FastAPI Backend</li>
                            <li>Scalable Architecture</li>
                            <li>Stateless Inference</li>
                        </ul>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                            Privacy First
                        </div>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li>Local SQLite Logs</li>
                            <li>No Telemetry</li>
                            <li>On-Prem Compatible</li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-2 flex flex-col justify-between">
                        <div>
                            <h3 className="text-white font-bold text-lg mb-2">Ready to secure your traffic?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                Integrate our ML-powered API into your existing infrastructure or use our standalone dashboard and browser extension.
                            </p>
                        </div>
                        <div className="flex">
                            <Link to="/url-scanner" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center gap-1 group">
                                Explore URL Scanner <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="text-center text-xs text-slate-600 pt-8 border-t border-slate-800/50">
                    AI Powered Web & File Security Shield • 2026 Academic Project
                </div>
            </section>
        </div>
    );
};
