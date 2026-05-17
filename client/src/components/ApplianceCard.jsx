import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import toast from 'react-hot-toast';

const APPLIANCE_ICONS = { Fan: '🌀', AC: '❄️', Lights: '💡', Heater: '🔥' };
const APPLIANCE_COLORS = {
  Fan: { on: 'border-blue-500/40 bg-blue-500/5', off: 'border-slate-700', icon: 'text-blue-400' },
  AC: { on: 'border-cyan-500/40 bg-cyan-500/5', off: 'border-slate-700', icon: 'text-cyan-400' },
  Lights: { on: 'border-yellow-500/40 bg-yellow-500/5', off: 'border-slate-700', icon: 'text-yellow-400' },
  Heater: { on: 'border-orange-500/40 bg-orange-500/5', off: 'border-slate-700', icon: 'text-orange-400' },
};

export default function ApplianceCard({ appliance, delay = 0 }) {
  const { toggleAppliance, updateIntensity, setApplianceMode } = useEnergy();
  const [toggling, setToggling] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

  const isOn = appliance.status === 'on';
  const colors = APPLIANCE_COLORS[appliance.applianceName] || APPLIANCE_COLORS.Lights;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleAppliance(appliance._id);
      toast.success(`${appliance.applianceName} turned ${isOn ? 'off' : 'on'}`);
    } catch {
      toast.error('Failed to toggle appliance');
    } finally {
      setToggling(false);
    }
  };

  const handleIntensity = async (e) => {
    const val = parseInt(e.target.value);
    try {
      await updateIntensity(appliance._id, val);
    } catch {
      toast.error('Failed to update intensity');
    }
  };

  const handleMode = async (mode) => {
    try {
      await setApplianceMode(appliance._id, mode);
      toast.success(`${appliance.applianceName} set to ${mode} mode`);
    } catch {
      toast.error('Failed to set mode');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className={`glass-card p-4 border transition-all duration-300 ${isOn ? colors.on : colors.off}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{APPLIANCE_ICONS[appliance.applianceName] || '⚡'}</span>
          <div>
            <p className="text-white font-semibold text-sm">{appliance.applianceName}</p>
            <p className="text-slate-500 text-xs">{appliance.roomId?.roomName || 'Room'}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSlider(!showSlider)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Status & Power */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isOn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className={`text-xs font-medium ${isOn ? 'text-emerald-400' : 'text-slate-500'}`}>
            {appliance.status.toUpperCase()}
          </span>
        </div>
        {isOn && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Zap size={10} className="text-yellow-400" />
            <span>{Math.round(appliance.powerUsage)}W</span>
          </div>
        )}
      </div>

      {/* Intensity bar */}
      {isOn && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Intensity</span>
            <span>{appliance.intensity}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${colors.icon.replace('text-', 'bg-')}`}
              style={{ width: `${appliance.intensity}%` }}
            />
          </div>
        </div>
      )}

      {/* Slider (expanded) */}
      {showSlider && isOn && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-3"
        >
          <input
            type="range"
            min="0"
            max="100"
            value={appliance.intensity}
            onChange={handleIntensity}
            className="w-full accent-emerald-400"
          />
        </motion.div>
      )}

      {/* Mode & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {['manual', 'auto'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleMode(mode)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                appliance.mode === mode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
            isOn ? 'bg-emerald-500' : 'bg-slate-700'
          } ${toggling ? 'opacity-50' : ''}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
              isOn ? 'left-5' : 'left-0.5'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}
