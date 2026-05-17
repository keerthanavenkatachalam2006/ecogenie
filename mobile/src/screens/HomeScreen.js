import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { roomsAPI, appliancesAPI, analyticsAPI, weatherAPI, automationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const WEATHER_ICONS = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Snow: '❄️', default: '🌤️' };

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningAuto, setRunningAuto] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [roomsRes, statsRes, weatherRes, analyticsRes, recRes] = await Promise.allSettled([
        roomsAPI.getAll(),
        appliancesAPI.getStats(),
        weatherAPI.get(),
        analyticsAPI.getOverview(),
        analyticsAPI.getRecommendations(),
      ]);
      if (roomsRes.status === 'fulfilled') setRooms(roomsRes.value.data.rooms);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.stats);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value.data.weather);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.overview);
      if (recRes.status === 'fulfilled') setRecommendations(recRes.value.data.recommendations.slice(0, 3));
    } catch (e) {
      console.log('Fetch error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchAll(); };

  const handleSimulate = async () => {
    try {
      const { data } = await roomsAPI.simulate();
      setRooms(data.rooms);
      Alert.alert('✅ Done', 'Sensor data updated!');
    } catch { Alert.alert('Error', 'Simulation failed'); }
  };

  const handleRunAutomation = async () => {
    setRunningAuto(true);
    try {
      const { data } = await automationAPI.run();
      Alert.alert('🤖 Automation', `${data.actionsCount} action(s) executed!`);
    } catch { Alert.alert('Error', 'Automation failed'); }
    finally { setRunningAuto(false); }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#10b981', '#3b82f6']} style={styles.loadingLogo}>
          <Ionicons name="flash" size={28} color="white" />
        </LinearGradient>
        <ActivityIndicator color={colors.green} size="large" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Loading ECOGENIE...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
    >
      {/* Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSimulate} style={styles.iconBtn}>
            <Ionicons name="refresh" size={20} color={colors.green} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard icon="flash" label="Power" value={`${stats?.totalPower || 0}W`} color={colors.yellow} bg={colors.yellowBg} />
        <StatCard icon="today" label="Today" value={`${analytics?.todayUsage || 0}kWh`} color={colors.blue} bg={colors.blueBg} />
        <StatCard icon="checkmark-circle" label="Active" value={`${stats?.active || 0}/${stats?.total || 0}`} color={colors.green} bg={colors.greenBg} />
        <StatCard icon="leaf" label="Score" value={`${analytics?.energySavingScore || 0}`} color={colors.purple} bg={colors.purpleBg} />
      </View>

      {/* Weather Card */}
      {weather && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherIcon}>{WEATHER_ICONS[weather.condition] || WEATHER_ICONS.default}</Text>
            <View>
              <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
              <Text style={styles.weatherDesc}>{weather.description}</Text>
              <Text style={styles.weatherLoc}>📍 {weather.location}</Text>
            </View>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherDetail}>💧 {weather.humidity}%</Text>
            <Text style={styles.weatherDetail}>💨 {weather.windSpeed} m/s</Text>
            <Text style={styles.weatherDetail}>👁 {weather.visibility} km</Text>
          </View>
        </View>
      )}

      {/* Automation Button */}
      <TouchableOpacity onPress={handleRunAutomation} disabled={runningAuto}>
        <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.autoBtn}>
          <Ionicons name="hardware-chip-outline" size={20} color="white" />
          <Text style={styles.autoBtnText}>
            {runningAuto ? 'Running Automation...' : '🤖 Run Smart Automation'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Rooms */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Rooms')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {rooms.map((room) => (
            <TouchableOpacity
              key={room._id}
              style={styles.roomCard}
              onPress={() => navigation.navigate('RoomDetail', { room })}
            >
              <Text style={styles.roomIcon}>{room.icon}</Text>
              <Text style={styles.roomName}>{room.roomName}</Text>
              <View style={styles.roomSensor}>
                <Text style={styles.roomTemp}>{room.sensors.temperature.toFixed(1)}°C</Text>
                <Text style={styles.roomHum}>{room.sensors.humidity.toFixed(0)}%</Text>
              </View>
              <View style={[styles.occupancyDot, { backgroundColor: room.sensors.occupancy ? colors.green : colors.border }]} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI Recommendations</Text>
          {recommendations.map((rec) => (
            <View key={rec.id} style={[styles.recCard, {
              borderLeftColor: rec.priority === 'high' ? colors.red : rec.priority === 'medium' ? colors.orange : colors.blue
            }]}>
              <Text style={styles.recIcon}>{rec.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recDesc}>{rec.description}</Text>
                <Text style={styles.recSavings}>{rec.savings}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          {[
            { icon: 'flash', label: 'Appliances', screen: 'Appliances', color: colors.yellow },
            { icon: 'bar-chart', label: 'Analytics', screen: 'Analytics', color: colors.blue },
            { icon: 'hardware-chip', label: 'Automation', screen: 'Automation', color: colors.purple },
            { icon: 'time', label: 'Activity', screen: 'Activity', color: colors.green },
          ].map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.quickCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.quickIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: color + '30' }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 100 },
  loadingContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  loadingLogo: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.textMuted, marginTop: 12, fontSize: 14 },

  header: { padding: 20, paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: colors.textMuted },
  userName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },

  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  weatherCard: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.bgCard,
    borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.blueBg,
  },
  weatherLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherIcon: { fontSize: 36 },
  weatherTemp: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  weatherDesc: { fontSize: 13, color: colors.textSecondary, textTransform: 'capitalize' },
  weatherLoc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  weatherRight: { justifyContent: 'center', gap: 4 },
  weatherDetail: { fontSize: 12, color: colors.textSecondary },

  autoBtn: { marginHorizontal: 16, marginBottom: 20, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  autoBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  seeAll: { fontSize: 13, color: colors.green, fontWeight: '600' },

  roomCard: {
    width: 130, backgroundColor: colors.bgCard, borderRadius: 16, padding: 14,
    marginRight: 12, borderWidth: 1, borderColor: colors.border, position: 'relative',
  },
  roomIcon: { fontSize: 28, marginBottom: 8 },
  roomName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 },
  roomSensor: { flexDirection: 'row', gap: 8 },
  roomTemp: { fontSize: 12, color: colors.orange, fontWeight: '600' },
  roomHum: { fontSize: 12, color: colors.blue, fontWeight: '600' },
  occupancyDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4 },

  recCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.bgCard, borderRadius: 12, padding: 12,
    marginBottom: 8, borderLeftWidth: 3,
  },
  recIcon: { fontSize: 20 },
  recTitle: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  recDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  recSavings: { fontSize: 11, color: colors.green, marginTop: 4, fontWeight: '600' },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: '47%', backgroundColor: colors.bgCard, borderRadius: 14,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
});
