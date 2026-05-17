import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Play, Pause, Bot, TrendingUp, Zap } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, automationAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RoomCard from '../components/RoomCard';
import WeatherWidget from '../components/WeatherWidget';
import ApplianceCard from '../components/ApplianceCard';
import { CardSkeleton, RoomCardSkeleton } from '../components/LoadingSkeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const {
    rooms, appliances, analytics, weather, loading,
    simulationActive, setSimulationActive,
    fetchRooms, fetchAppliances, fetchAnalytics, fetchWeather, simulateSensors
  } = useEnergy();
  const [recommendations, setRecommendations] = useState([]);
  const [runningAuto, setRunningAuto] = useState(false);

  useEffect(() => {
    analyticsAPI.getRecommendations().then(({ data }) => setRecommendations(data.recommendations)).catch(() => {});
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchRooms(), fetchAppliances(), fetchAnalytics(), fetchWeather()]);
    toast.success('Dashboard refreshed');
  };

  const handleSimulate = async () => {
    await simulateSensors();
    toast.success('Sensor data updated');
  };

  const handleRunAutomation = async () => {
    setRunningAuto(true);
    try {
      const { data } = await automationAPI.run();
      toast.success(`Automation: ${data.actionsCount} action(s) taken`);
      await fetchAppliances();
    } catch {
      toast.error('Automation failed');
    } finally {
      setRunningAuto(false);
    }
  };

  const activeAppliances = appliances.filter((a) => a.status === 'on');
  const totalPower = appliances.reduce((s, a) => s + (a.powerUsage || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-white"
          >
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </motion.h1>
          <p className="text-slate-400 text-sm mt-1">Here's your home energy overview</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
              simulationActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {simulationActive ? <Pause size={14} /> : <Play size={14} />}
            {simulationActive ? 'Live' : 'Simulate'}
          </button>
          <button onClick={handleSimulate} className="btn-secondary text-sm py-2 px-3">
            <RefreshCw size={14} />
            Update Sensors
          </button>
          <button onClick={handleRunAutomation} disabled={runningAuto} className="btn-primary text-sm py-2 px-3">
            <Bot size={14} />
            {runningAuto ? 'Running...' : 'Run Automation'}
          </button>
          <button onClick={handleRefresh} className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading.analytics ? (
          [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Current Power" value={Math.round(totalPower)} unit="W" icon="⚡" color="yellow" delay={0} />
            <StatCard title="Today's Usage" value={analytics?.todayUsage || '0.0'} unit="kWh" icon="📊" color="blue" delay={0.1} />
            <StatCard title="Active Devices" value={activeAppliances.length} unit={`/ ${appliances.length}`} icon="🔌" color="emerald" delay={0.2} />
            <StatCard title="Energy Score" value={analytics?.energySavingScore || 0} unit="/100" icon="🌿" color="purple" delay={0.3} />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Chart + Rooms */}
        <div className="xl:col-span-2 space-y-6">
          {/* Energy chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">Energy Consumption</h3>
                <p className="text-slate-500 text-xs">Last 7 days (kWh)</p>
              </div>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            {analytics?.dailyData ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.dailyData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="usage" stroke="#10b981" strokeWidth={2} fill="url(#energyGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="skeleton h-48 rounded-xl" />
            )}
          </motion.div>

          {/* Rooms */}
          <div>
            <h3 className="text-white font-semibold mb-3">Rooms Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loading.rooms
                ? [...Array(4)].map((_, i) => <RoomCardSkeleton key={i} />)
                : rooms.map((room, i) => <RoomCard key={room._id} room={room} delay={i * 0.1} />)
              }
            </div>
          </div>
        </div>

        {/* Right: Weather + Appliances + Recommendations */}
        <div className="space-y-6">
          <WeatherWidget weather={weather} />

          {/* Appliance breakdown pie */}
          {analytics?.applianceBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-5 border border-slate-700"
            >
              <h3 className="text-white font-semibold mb-4">Appliance Usage</h3>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={100} height={100}>
                  <PieChart>
                    <Pie data={analytics.applianceBreakdown} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="usage" paddingAngle={3}>
                      {analytics.applianceBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {analytics.applianceBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                      <span className="text-xs text-white font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-5 border border-purple-500/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Bot size={16} className="text-purple-400" />
                <h3 className="text-white font-semibold">AI Recommendations</h3>
              </div>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className={`p-3 rounded-xl border-l-2 ${
                    rec.priority === 'high' ? 'border-l-red-400 bg-red-500/5' :
                    rec.priority === 'medium' ? 'border-l-yellow-400 bg-yellow-500/5' :
                    'border-l-blue-400 bg-blue-500/5'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-base">{rec.icon}</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{rec.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{rec.description}</p>
                        <p className="text-emerald-400 text-xs mt-1 font-medium">{rec.savings}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick appliances */}
          <div>
            <h3 className="text-white font-semibold mb-3">Active Appliances</h3>
            {activeAppliances.length === 0 ? (
              <div className="glass-card p-6 border border-slate-700 text-center">
                <Zap size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No active appliances</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAppliances.slice(0, 4).map((a, i) => (
                  <ApplianceCard key={a._id} appliance={a} delay={i * 0.05} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
