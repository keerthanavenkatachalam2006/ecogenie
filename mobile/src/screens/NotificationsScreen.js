import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsAPI } from '../services/api';
import { colors } from '../theme/colors';

const TYPE_ICONS = { overheating: '🌡️', energy_excess: '⚡', appliance_fault: '⚠️', automation: '🤖', system: '🔧', info: 'ℹ️' };
const SEVERITY_COLORS = { low: colors.blue, medium: colors.orange, high: colors.red, critical: colors.red };

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data.notifications);
    } catch (e) { console.log(e.message); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { Alert.alert('Error', 'Failed to mark notifications'); }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifs(); }} tintColor={colors.green} />}
    >
      {notifications.length > 0 && (
        <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
          <Ionicons name="checkmark-done" size={16} color={colors.green} />
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>Alerts will appear here</Text>
        </View>
      ) : (
        notifications.map((notif) => (
          <View key={notif._id} style={[styles.card, !notif.isRead && styles.cardUnread, { borderLeftColor: SEVERITY_COLORS[notif.severity] || colors.blue }]}>
            <Text style={styles.notifIcon}>{TYPE_ICONS[notif.type] || 'ℹ️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>{notif.title}</Text>
              <Text style={styles.notifMsg}>{notif.message}</Text>
              <Text style={styles.notifTime}>{new Date(notif.createdAt).toLocaleString()}</Text>
            </View>
            {!notif.isRead && <View style={styles.unreadDot} />}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 100 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.greenBg, borderRadius: 10, padding: 10, marginBottom: 14, justifyContent: 'center' },
  markAllText: { color: colors.green, fontWeight: '600', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptySubText: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 10, borderLeftWidth: 4, borderWidth: 1, borderColor: colors.border },
  cardUnread: { borderColor: colors.border, backgroundColor: '#1e293b' },
  notifIcon: { fontSize: 22 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  notifMsg: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  notifTime: { fontSize: 11, color: colors.textMuted, marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.blue, alignSelf: 'flex-start', marginTop: 4 },
});
