import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Switch, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { appliancesAPI } from '../services/api';
import { colors } from '../theme/colors';

const APPLIANCE_CONFIG = {
  Fan:    { icon: '🌀', color: colors.blue,   bg: colors.blueBg },
  AC:     { icon: '❄️', color: colors.cyan,   bg: colors.cyanBg },
  Lights: { icon: '💡', color: colors.yellow, bg: colors.yellowBg },
  Heater: { icon: '🔥', color: colors.orange, bg: colors.orangeBg },
};

export default function AppliancesScreen() {
  const [appliances, setAppliances] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [toggling, setToggling] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const [appRes, statsRes] = await Promise.all([
        appliancesAPI.getAll(),
        appliancesAPI.getStats(),
      ]);
      setAppliances(appRes.data.appliances);
      setStats(statsRes.data.stats);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (appliance) => {
    setToggling((p) => ({ ...p, [appliance._id]: true }));
    try {
      const { data } = await appliancesAPI.toggle(appliance._id);
      setAppliances((prev) => prev.map((a) => a._id === appliance._id ? data.appliance : a));
    } catch {
      Alert.alert('Error', 'Failed to toggle appliance');
    } finally {
      setToggling((p) => ({ ...p, [appliance._id]: false }));
    }
  };

  const handleMode = async (appliance, mode) => {
    try {
      const { data } = await appliancesAPI.setMode(appliance._id, mode);
      setAppliances((prev) => prev.map((a) => a._id === appliance._id ? data.appliance : a));
    } catch {
      Alert.alert('Error', 'Failed to set mode');
    }
  };

  const filters = ['All', 'Fan', 'AC', 'Lights', 'Heater'];
  const filtered = filter === 'All' ? appliances : appliances.filter((a) => a.applianceName === filter);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green} size="large" />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.green} />}
    >
      {/* Stats */}
      {stats && (
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: colors.textPrimary },
            { label: 'Active', value: stats.active, color: colors.green },
            { label: 'Auto', value: stats.auto, color: colors.blue },
            { label: 'Power', value: `${stats.totalPower}W`, color: colors.yellow },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Appliance Cards */}
      {filtered.map((appliance) => {
        const config = APPLIANCE_CONFIG[appliance.applianceName] || APPLIANCE_CONFIG.Lights;
        const isOn = appliance.status === 'on';
        return (
          <View key={appliance._id} style={[styles.card, isOn && { borderColor: config.color + '50' }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <View style={[styles.appIcon, { backgroundColor: config.bg }]}>
                  <Text style={{ fontSize: 22 }}>{config.icon}</Text>
                </View>
                <View>
                  <Text style={styles.appName}>{appliance.applianceName}</Text>
                  <Text style={styles.appRoom}>{appliance.roomId?.roomName || 'Room'}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                {toggling[appliance._id]
                  ? <ActivityIndicator color={colors.green} size="small" />
                  : <Switch
                      value={isOn}
                      onValueChange={() => handleToggle(appliance)}
                      trackColor={{ false: colors.border, true: colors.green }}
                      thumbColor={isOn ? 'white' : colors.textMuted}
                    />
                }
              </View>
            </View>

            {/* Status row */}
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: isOn ? colors.green : colors.border }]} />
                <Text style={[styles.statusText, { color: isOn ? colors.green : colors.textMuted }]}>
                  {appliance.status.toUpperCase()}
                </Text>
              </View>
              {isOn && (
                <Text style={styles.powerText}>
                  <Ionicons name="flash" size={11} color={colors.yellow} /> {Math.round(appliance.powerUsage)}W
                </Text>
              )}
            </View>

            {/* Intensity bar */}
            {isOn && (
              <View style={styles.intensityRow}>
                <Text style={styles.intensityLabel}>Intensity</Text>
                <Text style={[styles.intensityValue, { color: config.color }]}>{appliance.intensity}%</Text>
                <View style={styles.intensityBar}>
                  <View style={[styles.intensityFill, { width: `${appliance.intensity}%`, backgroundColor: config.color }]} />
                </View>
              </View>
            )}

            {/* Mode buttons */}
            <View style={styles.modeRow}>
              {['manual', 'auto'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleMode(appliance, mode)}
                  style={[styles.modeBtn, appliance.mode === mode && styles.modeBtnActive]}
                >
                  <Text style={[styles.modeBtnText, appliance.mode === mode && styles.modeBtnTextActive]}>
                    {mode === 'auto' ? '🤖 Auto' : '👤 Manual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  filterRow: { marginBottom: 16 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.bgCard, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  filterBtnActive: { backgroundColor: colors.greenBg, borderColor: colors.green },
  filterText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: colors.green, fontWeight: '700' },

  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  appRoom: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cardRight: { alignItems: 'center', justifyContent: 'center' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  powerText: { fontSize: 12, color: colors.yellow, fontWeight: '600' },

  intensityRow: { marginBottom: 10 },
  intensityLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  intensityValue: { fontSize: 11, fontWeight: '700', position: 'absolute', right: 0 },
  intensityBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  intensityFill: { height: '100%', borderRadius: 2 },

  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  modeBtnActive: { backgroundColor: colors.greenBg, borderColor: colors.green },
  modeBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  modeBtnTextActive: { color: colors.green, fontWeight: '700' },
});
