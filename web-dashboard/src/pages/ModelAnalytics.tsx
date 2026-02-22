import { Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const ModelAnalytics = () => {
    // Mock Data for ROC Curve (True Positive Rate vs False Positive Rate)
    const rocData = [
        { fpr: 0, tpr: 0 },
        { fpr: 0.05, tpr: 0.82 },
        { fpr: 0.1, tpr: 0.91 },
        { fpr: 0.15, tpr: 0.95 },
        { fpr: 0.2, tpr: 0.97 },
        { fpr: 0.4, tpr: 0.985 },
        { fpr: 0.6, tpr: 0.99 },
        { fpr: 0.8, tpr: 0.995 },
        { fpr: 1, tpr: 1 },
    ];

    // Mock Confusion Matrix values
    const cm = {
        tp: 1420, fp: 21,
        fn: 18, tn: 8540
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Overall Accuracy</div>
                    <div className="text-2xl text-slate-200 font-mono">98.7%</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Precision</div>
                    <div className="text-2xl text-slate-200 font-mono">98.5%</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">Recall</div>
                    <div className="text-2xl text-slate-200 font-mono">98.7%</div>
                </div>
                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="text-slate-400 text-xs font-medium uppercase mb-1">F1-Score</div>
                    <div className="text-2xl text-slate-200 font-mono">98.6%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Confusion Matrix */}
                <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 min-h-[300px]">
                    <h4 className="text-sm font-medium text-slate-400 uppercase mb-6">Confusion Matrix</h4>

                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div></div>
                        <div className="text-slate-400 font-medium mb-2">Predicted Positive</div>
                        <div className="text-slate-400 font-medium mb-2">Predicted Negative</div>

                        <div className="text-slate-400 font-medium flex items-center justify-end pr-4">Actual Positive</div>
                        <div className="bg-gradient-to-br from-indigo-900/80 to-indigo-800/80 border border-indigo-500/30 rounded-lg p-6 flex flex-col justify-center">
                            <span className="text-2xl font-mono text-indigo-300">{cm.tp}</span>
                            <span className="text-xs text-indigo-400/70 mt-1 uppercase">True Positive</span>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/20 rounded-lg p-6 flex flex-col justify-center">
                            <span className="text-2xl font-mono text-red-300">{cm.fn}</span>
                            <span className="text-xs text-red-400/70 mt-1 uppercase">False Negative</span>
                        </div>

                        <div className="text-slate-400 font-medium flex items-center justify-end pr-4 mt-2">Actual Negative</div>
                        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 border border-yellow-500/20 rounded-lg p-6 mt-2 flex flex-col justify-center">
                            <span className="text-2xl font-mono text-yellow-300">{cm.fp}</span>
                            <span className="text-xs text-yellow-400/70 mt-1 uppercase">False Positive</span>
                        </div>
                        <div className="bg-gradient-to-br from-cyan-900/80 to-cyan-800/80 border border-cyan-500/30 rounded-lg p-6 mt-2 flex flex-col justify-center">
                            <span className="text-2xl font-mono text-cyan-300">{cm.tn}</span>
                            <span className="text-xs text-cyan-400/70 mt-1 uppercase">True Negative</span>
                        </div>
                    </div>
                </div>

                {/* ROC Curve Chart */}
                <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 min-h-[300px] flex flex-col">
                    <h4 className="text-sm font-medium text-slate-400 uppercase mb-6">ROC Curve (AUC: 0.992)</h4>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={rocData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="fpr"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickFormatter={(val) => val.toFixed(1)}
                                    type="number"
                                    domain={[0, 1]}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    domain={[0, 1]}
                                />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    formatter={(value: any) => [Number(value).toFixed(3), 'True Pos Rate']}
                                    labelFormatter={(label) => `False Pos Rate: ${Number(label).toFixed(2)}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="tpr"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTpr)"
                                    isAnimationActive={true}
                                />
                                {/* Baseline diagonal line */}
                                <Line type="linear" dataKey="fpr" stroke="#475569" strokeDasharray="5 5" strokeWidth={1} dot={false} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
