import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Thermometer, Droplets, Users, Zap, Bot, ToggleLeft } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import { roomsAPI, appliancesAPI } from '../services/api';
import ApplianceCard from '../components/ApplianceCard';
import { RoomCardSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function Rooms() {
  const { rooms, appliances, loading, fetchRooms, fetchAppliances, setRooms } = useEnergy();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAppliances, setRoomAppliances] = useState([]);
  const [loadingRoom, setLoadingRoom] = useState(false);

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    setLoadingRoom(true);
    try {
      const { data } = await roomsAPI.getOne(room._id);
      setRoomAppliances(data.appliances);
    } catch {
      toast.error('Failed to load room details');
    } finally {
      setLoadingRoom(false);
    }
  };

  const handleToggleAutomation = async (roomId) => {
    try {
      const { data } = await roomsAPI.toggleAutomation(roomId);
      setRooms((prev) => prev.map((r) => (r._id === roomId ? data.room : r)));
      if (selectedRoom?._id === roomId) setSelectedRoom(data.room);
      toast.success(data.message);
    } catch {
      toast.error('Failed to toggle automation');
    }
  };

  const handleSimulate = async () => {
    try {
      const { data } = await roomsAPI.simulate();
      setRooms(data.rooms);
      if (selectedRoom) {
        const updated = data.rooms.find((r) => r._id === selectedRoom._id);
        if (updated) setSelectedRoom(updated);
      }
      toast.success('Sensor data simulated');
    } catch {
      toast.error('Simulation failed');
    }
  };

  const activeRoom = selectedRoom || rooms[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor and control each room</p>
        </div>
        <button onClick={handleSimulate} className="btn-secondary text-sm">
          <RefreshCw size={14} />
          Simulate Sensors
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room list */}
        <div className="space-y-3">
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Select Room</h3>
          {loading.rooms
            ? [...Array(4)].map((_, i) => <RoomCardSkeleton key={i} />)
            : rooms.map((room, i) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSelectRoom(room)}
                  className={`glass-card p-4 cursor-pointer border transition-all duration-200 ${
                    activeRoom?._id === room._id
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{room.icon}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{room.roomName}</p>
                        <p className="text-slate-500 text-xs">{room.sensors.temperature.toFixed(1)}°C · {room.sensors.humidity.toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`w-2 h-2 rounded-full ${room.sensors.occupancy ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      {room.automationEnabled && <Bot size={10} className="text-blue-400" />}
                    </div>
                  </div>
                </motion.div>
              ))
          }
        </div>

        {/* Room detail */}
        <div className="lg:col-span-2 space-y-4">
          {activeRoom ? (
            <>
              {/* Room header */}
              <motion.div
                key={activeRoom._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeRoom.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{activeRoom.roomName}</h2>
                      <p className="text-slate-400 text-sm">
                        {activeRoom.sensors.occupancy ? '🟢 Occupied' : '⚫ Unoccupied'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAutomation(activeRoom._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                      activeRoom.automationEnabled
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Bot size={14} />
                    {activeRoom.automationEnabled ? 'Auto ON' : 'Auto OFF'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Temperature', value: `${activeRoom.sensors.temperature.toFixed(1)}°C`, icon: <Thermometer size={14} />, color: 'text-orange-400' },
                    { label: 'Humidity', value: `${activeRoom.sensors.humidity.toFixed(0)}%`, icon: <Droplets size={14} />, color: 'text-blue-400' },
                    { label: 'Occupancy', value: activeRoom.sensors.occupancy ? 'Present' : 'Absent', icon: <Users size={14} />, color: activeRoom.sensors.occupancy ? 'text-emerald-400' : 'text-slate-500' },
                    { label: 'Air Quality', value: `${activeRoom.sensors.airQuality?.toFixed(0)}%`, icon: <Zap size={14} />, color: 'text-purple-400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-800/50 rounded-xl p-3">
                      <div className={`flex items-center gap-1.5 mb-1 ${s.color}`}>
                        {s.icon}
                        <span className="text-xs text-slate-500">{s.label}</span>
                      </div>
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Appliances */}
              <div>
                <h3 className="text-white font-semibold mb-3">Appliances in {activeRoom.roomName}</h3>
                {loadingRoom ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="glass-card p-4 border border-slate-700">
                        <div className="skeleton h-4 w-24 mb-3 rounded" />
                        <div className="skeleton h-8 w-16 rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roomAppliances.map((a, i) => (
                      <ApplianceCard key={a._id} appliance={a} delay={i * 0.05} />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="glass-card p-12 border border-slate-700 text-center">
              <span className="text-4xl mb-3 block">🏠</span>
              <p className="text-slate-400">Select a room to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
