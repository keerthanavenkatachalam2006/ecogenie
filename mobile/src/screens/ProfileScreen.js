import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { colors } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.preferences?.location || 'New York');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name, preferences: { location, notifications } });
      Alert.alert('✅ Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'home-outline', label: 'Rooms', value: '4 rooms configured', color: colors.blue },
    { icon: 'flash-outline', label: 'Appliances', value: '16 appliances', color: colors.yellow },
    { icon: 'hardware-chip-outline', label: 'Automation Rules', value: '4 active rules', color: colors.purple },
    { icon: 'leaf-outline', label: 'Energy Goal', value: `${user?.preferences?.energyGoal || 100} kWh/month`, color: colors.green },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Profile Header */}
      <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.profileHeader}>
        <LinearGradient colors={['#10b981', '#3b82f6']} style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark" size={12} color={colors.green} />
          <Text style={styles.roleText}>Smart Home User</Text>
        </View>
      </LinearGradient>

      {/* Edit Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Edit Profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City (for weather)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Mumbai"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Text style={styles.toggleSub}>Receive alerts and automation updates</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.green }}
            thumbColor="white"
          />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <LinearGradient colors={['#10b981', '#059669']} style={styles.saveBtn}>
            {saving
              ? <ActivityIndicator color="white" size="small" />
              : <>
                  <Ionicons name="save-outline" size={18} color="white" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Overview</Text>
        {menuItems.map((item) => (
          <View key={item.label} style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* App version */}
      <View style={styles.versionCard}>
        <LinearGradient colors={['#10b981', '#3b82f6']} style={styles.versionLogo}>
          <Ionicons name="flash" size={18} color="white" />
        </LinearGradient>
        <View>
          <Text style={styles.versionName}>ECOGENIE v1.0.0</Text>
          <Text style={styles.versionSub}>AI-Driven Smart Energy Platform</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={20} color={colors.red} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 100 },
  profileHeader: { alignItems: 'center', padding: 28, paddingTop: 20 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: 'white' },
  profileName: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  profileEmail: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: colors.greenBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, color: colors.green, fontWeight: '600' },
  card: { margin: 16, marginBottom: 0, backgroundColor: colors.bgCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 44, color: colors.textPrimary, fontSize: 15 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  toggleSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  saveBtn: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  menuValue: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  versionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16, marginBottom: 0, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border },
  versionLogo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  versionName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  versionSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, padding: 14, borderRadius: 14, backgroundColor: colors.redBg, borderWidth: 1, borderColor: colors.red + '40' },
  logoutText: { color: colors.red, fontSize: 15, fontWeight: '700' },
});
