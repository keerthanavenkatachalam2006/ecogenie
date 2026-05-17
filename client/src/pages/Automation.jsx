import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Play, CheckCircle, Clock, Zap, Thermometer, Users, Sun } from 'lucide-react';
import { automationAPI, roomsAPI } from '../services/api';
import { useEnergy } from '../context/EnergyContext';
import toast from 'react-hot-toast';

const AUTOMATION_RULES = [
  {
    id: 1, icon: <Thermometer size={16} />, title: 'Temperature Control',
    description: 'Automatically adjusts Fan/AC/Heater based on room temperature thresholds.',
    triggers: ['Temp > 30°C → Fan at 100%', 'Temp > 32°C → AC ON', 'Temp < 18°C → Heater ON'],
    color: 'orange',
  },
  {
    id: 2, icon: <Users size={16} />, title: 'Occupancy Detection',
    description: 'Turns off all appliances when a room becomes unoccupied.',
    triggers: ['Room empty → All appliances OFF', 'Room occupied → Restore settings'],
    color: 'blue',
  },
  {
    id: 3, icon: <Sun size={16} />, title: 'Lighting Optimization',
    description: 'Adjusts lighting intensity based on time of day.',
    triggers: ['6 PM–11 PM → Lights at 80%', '11 PM–6 AM → Lights dimmed to 30%', 'Room empty → Lights OFF'],
    color: 'yellow',
  },
  {
    id: 4, icon: <Zap size={16} />, title: 'Energy Saving Mode',
    description: 'Reduces overall energy consumption during peak hours.',
    triggers: ['Peak hours (6–9 PM) → Reduce intensity', 'Low occupancy → Standby mode'],
    color: 'emerald',
  },
];

const COLOR_MAP = {
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

export default function Automation() {
  const { rooms, setRooms, fetchAppliances } = useEnergy();
  const [status, setStatus] = useState(null);
  const [running, setRunning] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    automationAPI.getStatus().then(({ data }) => {
      setStatus(data.status);
      setRecentLogs(data.status.recentActions || []);
    }).catch(() => {});
  }, []);

  const handleRunAutomation = async () => {
    setRunning(true);
    try {
      const { data } = await automationAPI.run();
      toast.success(`✅ ${data.actionsCount} automation action(s) executed`);
      setRecentLogs(data.logs || []);
      await fetchAppliances();
      // Refresh status
      const statusRes = await automationAPI.getStatus();
      setStatus(statusRes.data.status);
    } catch {
      toast.error('Automation engine failed');
    } finally {
      setRunning(false);
    }
  };

  const handleToggleRoomAuto = async (roomId) => {
    try {
      const { data } = await roomsAPI.toggleAutomation(roomId);
      setRooms((prev) => prev.map((r) => (r._id === roomId ? data.room : r)));
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle automation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Engine</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered smart home automation rules</p>
        </div>
        <button
          onClick={handleRunAutomation}
          disabled={running}
          className="btn-primary"
        >
          <Play size={16} />
          {running ? 'Running...' : 'Run Automation'}
        </button>
      </div>

      {/* Status cards */}
      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Rooms', value: status.totalRooms, icon: '🏠' },
            { label: 'Auto Enabled', value: status.automationEnabledRooms, icon: '🤖' },
            { label: 'Auto Appliances', value: status.autoModeAppliances, icon: '⚡' },
            { label: 'Recent Actions', value: recentLogs.length, icon: '📋' },
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
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Automation rules */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold">Active Rules</h3>
          {AUTOMATION_RULES.map((rule, i) => {
            const c = COLOR_MAP[rule.color];
            return (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-4 border ${c.border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center ${c.text} flex-shrink-0`}>
                    {rule.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold text-sm">{rule.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>Active</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">{rule.description}</p>
                    <div className="space-y-1">
                      {rule.triggers.map((t, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-xs text-slate-500">
                          <CheckCircle size={10} className={c.text} />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Room automation toggles + Recent logs */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-semibold mb-3">Room Automation</h3>
            <div className="space-y-2">
              {rooms.map((room, i) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-4 border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{room.icon}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{room.roomName}</p>
                      <p className="text-slate-500 text-xs">{room.sensors.temperature.toFixed(1)}°C · {room.sensors.occupancy ? 'Occupied' : 'Empty'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleRoomAuto(room._id)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${room.automationEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${room.automationEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent automation logs */}
          <div>
            <h3 className="text-white font-semibold mb-3">Recent Actions</h3>
            <div className="glass-card border border-slate-700 overflow-hidden">
              {recentLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <Bot size={24} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No automation actions yet</p>
                  <p className="text-slate-600 text-xs mt-1">Run automation to see actions here</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {recentLogs.slice(0, 8).map((log, i) => (
                    <div key={log._id || i} className="p-3 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={10} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{log.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {log.roomName && <span className="text-slate-600 text-xs">{log.roomName}</span>}
                          <span className="text-slate-700 text-xs">·</span>
                          <span className="text-slate-600 text-xs flex items-center gap-1">
                            <Clock size={8} />
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
