import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Leaf, Zap, RefreshCw } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, recRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getRecommendations(),
      ]);
      setOverview(ovRes.data.overview);
      setRecommendations(recRes.data.recommendations);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Energy insights and consumption trends</p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Today's Usage" value={overview?.todayUsage || 0} unit="kWh" icon="📊" color="blue" delay={0} />
            <StatCard title="Monthly Usage" value={overview?.monthUsage || 0} unit="kWh" icon="📅" color="purple" delay={0.1} />
            <StatCard title="Estimated Bill" value={`$${overview?.estimatedBill || 0}`} unit="" icon="💰" color="orange" delay={0.2} />
            <StatCard title="Energy Score" value={overview?.energySavingScore || 0} unit="/100" icon="🌿" color="emerald" delay={0.3} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Weekly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Weekly Consumption</h3>
              <p className="text-slate-500 text-xs">kWh per day</p>
            </div>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          {overview?.dailyData ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={overview.dailyData}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} fill="url(#grad1)" name="Usage (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-52 rounded-xl" />}
        </motion.div>

        {/* Monthly trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold">Monthly Trend</h3>
              <p className="text-slate-500 text-xs">Last 6 months</p>
            </div>
            <DollarSign size={16} className="text-blue-400" />
          </div>
          {overview?.monthlyData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={overview.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Usage (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-52 rounded-xl" />}
        </motion.div>

        {/* Appliance breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 border border-slate-700"
        >
          <h3 className="text-white font-semibold mb-4">Appliance Breakdown</h3>
          {overview?.applianceBreakdown ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={overview.applianceBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="usage" paddingAngle={3}>
                    {overview.applianceBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {overview.applianceBreakdown.map((item, i) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-sm text-slate-300">{item.name}</span>
                      </div>
                      <span className="text-sm text-white font-medium">{item.usage} kWh</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="skeleton h-40 rounded-xl" />}
        </motion.div>

        {/* Room breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5 border border-slate-700"
        >
          <h3 className="text-white font-semibold mb-4">Room Consumption</h3>
          {overview?.roomBreakdown ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={overview.roomBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Usage (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="skeleton h-48 rounded-xl" />}
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold">AI Energy Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`p-4 rounded-xl border-l-4 ${
                rec.priority === 'high' ? 'border-l-red-400 bg-red-500/5' :
                rec.priority === 'medium' ? 'border-l-yellow-400 bg-yellow-500/5' :
                'border-l-blue-400 bg-blue-500/5'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-xl">{rec.icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{rec.title}</p>
                    <p className="text-slate-400 text-xs mt-1">{rec.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-emerald-400 text-xs font-medium">{rec.savings}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{rec.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
