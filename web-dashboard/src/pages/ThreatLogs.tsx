import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

interface ThreatLog {
    id: string;
    time: string;
    type: string;
    target: string;
    result: string;
    confidence: string;
}

export const ThreatLogs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [logs, setLogs] = useState<ThreatLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await axios.get('http://localhost:8000/logs');
                if (response.data && response.data.logs) {
                    setLogs(response.data.logs);
                }
            } catch (error) {
                console.error("Failed to fetch logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:8000/logs/${id}`);
            // Optimistically update the UI
            setLogs(logs.filter(log => log.id !== id));
        } catch (error) {
            console.error("Failed to delete log:", error);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.result.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'All Types' ||
            (typeFilter === 'URL Only' && log.type === 'URL') ||
            (typeFilter === 'File Only' && log.type === 'FILE');

        return matchesSearch && matchesType;
    });

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs by ID, target, or result..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none transition-colors"
                >
                    <option>All Types</option>
                    <option>URL Only</option>
                    <option>File Only</option>
                </select>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 font-medium border-b border-slate-700/50">
                        <tr>
                            <th className="p-4 py-3">Scan ID</th>
                            <th className="p-4 py-3">Time</th>
                            <th className="p-4 py-3">Type</th>
                            <th className="p-4 py-3">Target Payload</th>
                            <th className="p-4 py-3">Prediction</th>
                            <th className="p-4 py-3">Confidence</th>
                            <th className="p-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-cyan-500 rounded-full animate-spin"></div>
                                        Fetching scan history...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/60 transition-colors">
                                    <td className="p-4 text-slate-500 font-mono text-xs">{log.id}</td>
                                    <td className="p-4">{log.time}</td>
                                    <td className="p-4">
                                        <span className="bg-slate-700/50 px-2 py-1 rounded text-xs">{log.type}</span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-200">{log.target}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-wider ${log.result === 'SAFE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            log.result === 'SUSPICIOUS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {log.result}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400">{log.confidence}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors inline-flex justify-center items-center"
                                            title="Delete log"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                                    No logs found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
