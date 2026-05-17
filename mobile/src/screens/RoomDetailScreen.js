import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appliancesAPI } from '../services/api';
import { colors } from '../theme/colors';

const APPLIANCE_CONFIG = {
  Fan:    { icon: '🌀', color: colors.blue },
  AC:     { icon: '❄️', color: colors.cyan },
  Lights: { icon: '💡', color: colors.yellow },
  Heater: { icon: '🔥', color: colors.orange },
};

export default function RoomDetailScreen({ route }) {
  const { room } = route.params;
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});

  useEffect(() => {
    appliancesAPI.getAll(room._id)
      .then(({ data }) => setAppliances(data.appliances))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (appliance) => {
    setToggling((p) => ({ ...p, [appliance._id]: true }));
    try {
      const { data } = await appliancesAPI.toggle(appliance._id);
      setAppliances((prev) => prev.map((a) => a._id === appliance._id ? data.appliance : a));
    } catch { Alert.alert('Error', 'Failed to toggle'); }
    finally { setToggling((p) => ({ ...p, [appliance._id]: false })); }
  };

  const handleMode = async (appliance, mode) => {
    try {
      const { data } = await appliancesAPI.setMode(appliance._id, mode);
      setAppliances((prev) => prev.map((a) => a._id === appliance._id ? data.appliance : a));
    } catch { Alert.alert('Error', 'Failed to set mode'); }
  };

  const tempColor = room.sensors.temperature > 30 ? colors.red : room.sensors.temperature > 26 ? colors.orange : colors.green;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Room info card */}
      <View style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomIcon}>{room.icon}</Text>
          <View>
            <Text style={styles.roomName}>{room.roomName}</Text>
            <View style={styles.occupancyRow}>
              <View style={[styles.dot, { backgroundColor: room.sensors.occupancy ? colors.green : colors.border }]} />
              <Text style={styles.occupancyText}>{room.sensors.occupancy ? '🟢 Occupied' : '⚫ Empty'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.sensorRow}>
          {[
            { label: 'Temperature', value: `${room.sensors.temperature.toFixed(1)}°C`, color: tempColor, icon: 'thermometer' },
            { label: 'Humidity', value: `${room.sensors.humidity.toFixed(0)}%`, color: colors.blue, icon: 'water' },
            { label: 'Air Quality', value: `${room.sensors.airQuality?.toFixed(0)}%`, color: colors.green, icon: 'leaf' },
            { label: 'Light', value: `${room.sensors.lightLevel?.toFixed(0)} lx`, color: colors.yellow, icon: 'sunny' },
          ].map((s) => (
            <View key={s.label} style={styles.sensorBox}>
              <Ionicons name={s.icon + '-outline'} size={16} color={s.color} />
              <Text style={[styles.sensorValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.sensorLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Appliances */}
      <Text style={styles.sectionTitle}>Appliances</Text>
      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />
      ) : (
        appliances.map((appliance) => {
          const config = APPLIANCE_CONFIG[appliance.applianceName] || APPLIANCE_CONFIG.Lights;
          const isOn = appliance.status === 'on';
          return (
            <View key={appliance._id} style={[styles.appCard, isOn && { borderColor: config.color + '50' }]}>
              <View style={styles.appTop}>
                <View style={styles.appLeft}>
                  <Text style={styles.appIcon}>{config.icon}</Text>
                  <View>
                    <Text style={styles.appName}>{appliance.applianceName}</Text>
                    <Text style={[styles.appStatus, { color: isOn ? colors.green : colors.textMuted }]}>
                      {isOn ? `ON • ${Math.round(appliance.powerUsage)}W` : 'OFF'}
                    </Text>
                  </View>
                </View>
                {toggling[appliance._id]
                  ? <ActivityIndicator color={colors.green} size="small" />
                  : <Switch
                      value={isOn}
                      onValueChange={() => handleToggle(appliance)}
                      trackColor={{ false: colors.border, true: colors.green }}
                      thumbColor="white"
                    />
                }
              </View>

              {isOn && (
                <View style={styles.intensityContainer}>
                  <View style={styles.intensityHeader}>
                    <Text style={styles.intensityLabel}>Intensity</Text>
                    <Text style={[styles.intensityPct, { color: config.color }]}>{appliance.intensity}%</Text>
                  </View>
                  <View style={styles.intensityBar}>
                    <View style={[styles.intensityFill, { width: `${appliance.intensity}%`, backgroundColor: config.color }]} />
                  </View>
                </View>
              )}

              <View style={styles.modeRow}>
                {['manual', 'auto'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleMode(appliance, mode)}
                    style={[styles.modeBtn, appliance.mode === mode && { backgroundColor: colors.greenBg, borderColor: colors.green }]}
                  >
                    <Text style={[styles.modeBtnText, appliance.mode === mode && { color: colors.green }]}>
                      {mode === 'auto' ? '🤖 Auto' : '👤 Manual'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 100 },
  roomCard: { backgroundColor: colors.bgCard, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  roomHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  roomIcon: { fontSize: 36 },
  roomName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  occupancyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  occupancyText: { fontSize: 13, color: colors.textSecondary },
  sensorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sensorBox: { width: '47%', backgroundColor: colors.bg, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  sensorValue: { fontSize: 18, fontWeight: '700' },
  sensorLabel: { fontSize: 11, color: colors.textMuted },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  appCard: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  appTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  appLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appIcon: { fontSize: 26 },
  appName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  appStatus: { fontSize: 12, marginTop: 2 },
  intensityContainer: { marginBottom: 10 },
  intensityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  intensityLabel: { fontSize: 11, color: colors.textMuted },
  intensityPct: { fontSize: 11, fontWeight: '700' },
  intensityBar: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  intensityFill: { height: '100%', borderRadius: 2 },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  modeBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
});
