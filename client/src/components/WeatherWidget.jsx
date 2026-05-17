import { motion } from 'framer-motion';
import { Wind, Droplets, Eye, Thermometer } from 'lucide-react';

const WEATHER_ICONS = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Snow: '❄️',
  Thunderstorm: '⛈️',
  Mist: '🌫️',
  Fog: '🌫️',
};

export default function WeatherWidget({ weather }) {
  if (!weather) {
    return (
      <div className="glass-card p-5 border border-slate-700">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-10 w-20 mb-2" />
        <div className="skeleton h-3 w-32" />
      </div>
    );
  }

  const icon = WEATHER_ICONS[weather.condition] || '🌤️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-slate-900/50"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Outdoor Weather</p>
          <p className="text-white font-semibold">{weather.location}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-white">{weather.temperature}°</span>
        <span className="text-slate-400 text-sm mb-1">C</span>
        <span className="text-slate-500 text-sm mb-1 ml-1">Feels {weather.feelsLike}°</span>
      </div>

      <p className="text-slate-400 text-sm capitalize mb-4">{weather.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Droplets size={12} className="text-blue-400" />
          <span>{weather.humidity}% humidity</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Wind size={12} className="text-cyan-400" />
          <span>{weather.windSpeed} m/s</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Eye size={12} className="text-purple-400" />
          <span>{weather.visibility} km</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Thermometer size={12} className="text-orange-400" />
          <span>{weather.pressure} hPa</span>
        </div>
      </div>
    </motion.div>
  );
}
