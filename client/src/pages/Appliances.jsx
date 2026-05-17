import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Zap, BarChart2 } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import { appliancesAPI } from '../services/api';
import ApplianceCard from '../components/ApplianceCard';

const FILTERS = ['All', 'Fan', 'AC', 'Lights', 'Heater'];
const STATUS_FILTERS = ['All', 'On', 'Off', 'Auto'];

export default function Appliances() {
  const { appliances, loading, fetchAppliances } = useEnergy();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    appliancesAPI.getStats().then(({ data }) => setStats(data.stats)).catch(() => {});
  }, [appliances]);

  const filtered = appliances.filter((a) => {
    const typeMatch = typeFilter === 'All' || a.applianceName === typeFilter;
    const statusMatch = statusFilter === 'All' ||
      (statusFilter === 'On' && a.status === 'on') ||
      (statusFilter === 'Off' && a.status === 'off') ||
      (statusFilter === 'Auto' && a.mode === 'auto');
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appliances</h1>
          <p className="text-slate-400 text-sm mt-1">Control all your smart devices</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: '🔌', color: 'text-slate-300' },
            { label: 'Active', value: stats.active, icon: '✅', color: 'text-emerald-400' },
            { label: 'Auto Mode', value: stats.auto, icon: '🤖', color: 'text-blue-400' },
            { label: 'Power Draw', value: `${stats.totalPower}W`, icon: '⚡', color: 'text-yellow-400' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 border border-slate-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <span>{s.icon}</span>
                <span className="text-slate-500 text-xs">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <span className="text-slate-500 text-xs">Type:</span>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xs">Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Appliance grid */}
      {loading.appliances ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-4 border border-slate-700">
              <div className="skeleton h-4 w-24 mb-3 rounded" />
              <div className="skeleton h-8 w-16 rounded mb-2" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 border border-slate-700 text-center">
          <Zap size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No appliances match the filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a, i) => (
            <ApplianceCard key={a._id} appliance={a} delay={i * 0.03} />
          ))}
        </div>
      )}
    </div>
  );
}
