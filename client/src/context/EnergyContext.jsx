import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { roomsAPI, appliancesAPI, analyticsAPI, weatherAPI, notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const EnergyContext = createContext(null);

export const EnergyProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState({ rooms: false, appliances: false, analytics: false });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [simulationActive, setSimulationActive] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading((p) => ({ ...p, rooms: true }));
    try {
      const { data } = await roomsAPI.getAll();
      setRooms(data.rooms);
      if (!selectedRoom && data.rooms.length > 0) setSelectedRoom(data.rooms[0]);
    } catch (e) {
      console.error('Failed to fetch rooms', e);
    } finally {
      setLoading((p) => ({ ...p, rooms: false }));
    }
  }, [selectedRoom]);

  const fetchAppliances = useCallback(async (roomId) => {
    setLoading((p) => ({ ...p, appliances: true }));
    try {
      const { data } = await appliancesAPI.getAll(roomId);
      setAppliances(data.appliances);
    } catch (e) {
      console.error('Failed to fetch appliances', e);
    } finally {
      setLoading((p) => ({ ...p, appliances: false }));
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading((p) => ({ ...p, analytics: true }));
    try {
      const { data } = await analyticsAPI.getOverview();
      setAnalytics(data.overview);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading((p) => ({ ...p, analytics: false }));
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const { data } = await weatherAPI.get();
      setWeather(data.weather);
    } catch (e) {
      console.error('Failed to fetch weather', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationsAPI.getAll({ limit: 10 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }, []);

  const simulateSensors = useCallback(async () => {
    try {
      const { data } = await roomsAPI.simulate();
      setRooms(data.rooms);
    } catch (e) {
      console.error('Simulation error', e);
    }
  }, []);

  const toggleAppliance = useCallback(async (id) => {
    try {
      const { data } = await appliancesAPI.toggle(id);
      setAppliances((prev) => prev.map((a) => (a._id === id ? data.appliance : a)));
      return data.appliance;
    } catch (e) {
      throw e;
    }
  }, []);

  const updateIntensity = useCallback(async (id, intensity) => {
    try {
      const { data } = await appliancesAPI.setIntensity(id, intensity);
      setAppliances((prev) => prev.map((a) => (a._id === id ? data.appliance : a)));
    } catch (e) {
      throw e;
    }
  }, []);

  const setApplianceMode = useCallback(async (id, mode) => {
    try {
      const { data } = await appliancesAPI.setMode(id, mode);
      setAppliances((prev) => prev.map((a) => (a._id === id ? data.appliance : a)));
    } catch (e) {
      throw e;
    }
  }, []);

  // Initial data load
  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchAppliances();
      fetchAnalytics();
      fetchWeather();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  // Auto-simulation every 30 seconds
  useEffect(() => {
    if (!isAuthenticated || !simulationActive) return;
    const interval = setInterval(() => {
      simulateSensors();
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, simulationActive, simulateSensors]);

  return (
    <EnergyContext.Provider
      value={{
        rooms,
        appliances,
        analytics,
        weather,
        notifications,
        unreadCount,
        loading,
        selectedRoom,
        simulationActive,
        setSelectedRoom,
        setSimulationActive,
        fetchRooms,
        fetchAppliances,
        fetchAnalytics,
        fetchWeather,
        fetchNotifications,
        simulateSensors,
        toggleAppliance,
        updateIntensity,
        setApplianceMode,
        setRooms,
        setAppliances,
        setNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </EnergyContext.Provider>
  );
};

export const useEnergy = () => {
  const context = useContext(EnergyContext);
  if (!context) throw new Error('useEnergy must be used within EnergyProvider');
  return context;
};
