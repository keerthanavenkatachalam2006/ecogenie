import { motion } from 'framer-motion';
import { Thermometer, Droplets, Users, Zap, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoomCard({ room, delay = 0, onClick }) {
  const navigate = useNavigate();

  const tempColor =
    room.sensors.temperature > 30 ? 'text-red-400' :
    room.sensors.temperature > 26 ? 'text-orange-400' :
    room.sensors.temperature < 18 ? 'text-blue-400' : 'text-emerald-400';

  const humColor =
    room.sensors.humidity > 70 ? 'text-blue-400' :
    room.sensors.humidity < 30 ? 'text-orange-400' : 'text-cyan-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick || (() => navigate(`/rooms/${room._id}`))}
      className="glass-card-hover p-5 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{room.icon}</span>
          <div>
            <h3 className="text-white font-semibold">{room.roomName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${room.sensors.occupancy ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-xs text-slate-500">{room.sensors.occupancy ? 'Occupied' : 'Empty'}</span>
            </div>
          </div>
        </div>
        {room.automationEnabled && (
          <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">
            <Bot size={10} className="text-blue-400" />
            <span className="text-xs text-blue-400">Auto</span>
          </div>
        )}
      </div>

      {/* Sensor readings */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Thermometer size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">Temperature</span>
          </div>
          <span className={`text-xl font-bold ${tempColor}`}>{room.sensors.temperature.toFixed(1)}°C</span>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Droplets size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">Humidity</span>
          </div>
          <span className={`text-xl font-bold ${humColor}`}>{room.sensors.humidity.toFixed(0)}%</span>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">Occupancy</span>
          </div>
          <span className={`text-sm font-semibold ${room.sensors.occupancy ? 'text-emerald-400' : 'text-slate-500'}`}>
            {room.sensors.occupancy ? 'Present' : 'Absent'}
          </span>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">Air Quality</span>
          </div>
          <span className={`text-sm font-semibold ${room.sensors.airQuality > 80 ? 'text-emerald-400' : room.sensors.airQuality > 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {room.sensors.airQuality.toFixed(0)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
