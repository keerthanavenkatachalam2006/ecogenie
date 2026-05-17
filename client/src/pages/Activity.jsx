import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Filter, Trash2, RefreshCw } from 'lucide-react';
import { activityAPI } from '../services/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  user_action: { label: 'User', color: 'bg-blue-500/20 text-blue-400', icon: '👤' },
  automation: { label: 'Auto', color: 'bg-purple-500/20 text-purple-400', icon: '🤖' },
  alert: { label: 'Alert', color: 'bg-red-500/20 text-red-400', icon: '⚠️' },
  system: { label: 'System', color: 'bg-slate-500/20 text-slate-400', icon: '🔧' },
};

const SEVERITY_COLORS = {
  info: 'text-blue-400',
  warning: 'text-yellow-400',
  critical: 'text-red-400',
  success: 'text-emerald-400',
};

export default function ActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter !== 'all') params.type = typeFilter;
      const { data } = await activityAPI.getLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [typeFilter]);

  const handleClear = async () => {
    if (!confirm('Clear all activity logs?')) return;
    try {
      await activityAPI.clear();
      setLogs([]);
      toast.success('Activity logs cleared');
    } catch {
      toast.error('Failed to clear logs');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 text-sm mt-1">Track all system and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchLogs()} className="btn-secondary text-sm">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-slate-500" />
        {['all', 'user_action', 'automation', 'alert', 'system'].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === t
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {t === 'all' ? 'All' : TYPE_CONFIG[t]?.label || t}
          </button>
        ))}
      </div>

      {/* Logs table */}
      <div className="glass-card border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <Activity size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {logs.map((log, i) => {
              const typeConf = TYPE_CONFIG[log.type] || TYPE_CONFIG.system;
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">{typeConf.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm font-medium">{log.description}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${typeConf.color}`}>
                        {typeConf.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {log.roomName && (
                        <span className="text-slate-500 text-xs">📍 {log.roomName}</span>
                      )}
                      {log.applianceName && (
                        <span className="text-slate-500 text-xs">⚡ {log.applianceName}</span>
                      )}
                      <span className={`text-xs ${SEVERITY_COLORS[log.severity] || 'text-slate-500'}`}>
                        {log.severity}
                      </span>
                      <span className="text-slate-600 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchLogs(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                pagination.page === i + 1
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
