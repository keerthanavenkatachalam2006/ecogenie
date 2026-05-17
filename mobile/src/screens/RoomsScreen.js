import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Switch, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roomsAPI, appliancesAPI } from '../services/api';
import { colors } from '../theme/colors';

export default function RoomsScreen({ navigation }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await roomsAPI.getAll();
      setRooms(data.rooms);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchRooms(); }, []);

  const handleToggleAuto = async (roomId) => {
    try {
      const { data } = await roomsAPI.toggleAutomation(roomId);
      setRooms((prev) => prev.map((r) => r._id === roomId ? data.room : r));
    } catch { Alert.alert('Error', 'Failed to toggle automation'); }
  };

  const handleSimulate = async () => {
    try {
      const { data } = await roomsAPI.simulate();
      setRooms(data.rooms);
      Alert.alert('✅', 'Sensor data updated!');
    } catch { Alert.alert('Error', 'Simulation failed'); }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.green} size="large" />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={colors.green} />}
    >
      {/* Simulate button */}
      <TouchableOpacity onPress={handleSimulate} style={styles.simBtn}>
        <Ionicons name="refresh-circle" size={18} color={colors.green} />
        <Text style={styles.simBtnText}>Update Sensor Data</Text>
      </TouchableOpacity>

      {rooms.map((room, i) => {
        const tempColor = room.sensors.temperature > 30 ? colors.red : room.sensors.temperature > 26 ? colors.orange : colors.green;
        return (
          <TouchableOpacity
            key={room._id}
            style={styles.card}
            onPress={() => navigation.navigate('RoomDetail', { room })}
            activeOpacity={0.8}
          >
            {/* Room header */}
            <View style={styles.cardHeader}>
              <View style={styles.roomInfo}>
                <Text style={styles.roomIcon}>{room.icon}</Text>
                <View>
                  <Text style={styles.roomName}>{room.roomName}</Text>
                  <View style={styles.occupancyRow}>
                    <View style={[styles.dot, { backgroundColor: room.sensors.occupancy ? colors.green : colors.border }]} />
                    <Text style={styles.occupancyText}>{room.sensors.occupancy ? 'Occupied' : 'Empty'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.autoToggle}>
                <Text style={styles.autoLabel}>Auto</Text>
                <Switch
                  value={room.automationEnabled}
                  onValueChange={() => handleToggleAuto(room._id)}
                  trackColor={{ false: colors.border, true: colors.blue }}
                  thumbColor="white"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            </View>

            {/* Sensor grid */}
            <View style={styles.sensorGrid}>
              <SensorItem icon="thermometer" label="Temp" value={`${room.sensors.temperature.toFixed(1)}°C`} color={tempColor} />
              <SensorItem icon="water" label="Humidity" value={`${room.sensors.humidity.toFixed(0)}%`} color={colors.blue} />
              <SensorItem icon="leaf" label="Air Quality" value={`${room.sensors.airQuality?.toFixed(0)}%`} color={colors.green} />
              <SensorItem icon="sunny" label="Light" value={`${room.sensors.lightLevel?.toFixed(0)} lx`} color={colors.yellow} />
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.tapHint}>Tap to manage appliances →</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function SensorItem({ icon, label, value, color }) {
  return (
    <View style={styles.sensorItem}>
      <Ionicons name={icon + '-outline'} size={14} color={color} />
      <Text style={styles.sensorLabel}>{label}</Text>
      <Text style={[styles.sensorValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },

  simBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.bgCard, borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: colors.greenBg,
  },
  simBtnText: { color: colors.green, fontWeight: '600', fontSize: 14 },

  card: { backgroundColor: colors.bgCard, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roomIcon: { fontSize: 32 },
  roomName: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  occupancyRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  occupancyText: { fontSize: 12, color: colors.textMuted },
  autoToggle: { alignItems: 'center' },
  autoLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },

  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sensorItem: { width: '47%', backgroundColor: colors.bg, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sensorLabel: { fontSize: 11, color: colors.textMuted, flex: 1 },
  sensorValue: { fontSize: 13, fontWeight: '700' },

  cardFooter: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  tapHint: { fontSize: 12, color: colors.textMuted, textAlign: 'right' },
});
