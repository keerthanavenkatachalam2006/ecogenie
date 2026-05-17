import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return Alert.alert('Error', 'Please fill all fields');
    if (form.password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    if (form.password !== form.confirm) return Alert.alert('Error', 'Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email.trim().toLowerCase(), form.password);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'John Doe', icon: 'person-outline', keyboard: 'default' },
    { key: 'email', label: 'Email', placeholder: 'you@example.com', icon: 'mail-outline', keyboard: 'email-address' },
    { key: 'password', label: 'Password', placeholder: 'Min. 6 characters', icon: 'lock-closed-outline', secure: true },
    { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password', icon: 'lock-closed-outline', secure: true },
  ];

  return (
    <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.logoContainer}>
            <LinearGradient colors={['#10b981', '#3b82f6']} style={styles.logoBox}>
              <Ionicons name="flash" size={32} color="white" />
            </LinearGradient>
            <Text style={styles.appName}>ECOGENIE</Text>
            <Text style={styles.tagline}>Start optimizing your energy today</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of smart home users</Text>

            {fields.map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={field.icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={form[field.key]}
                    onChangeText={(v) => setForm({ ...form, [field.key]: v })}
                    keyboardType={field.keyboard || 'default'}
                    autoCapitalize={field.key === 'name' ? 'words' : 'none'}
                    secureTextEntry={field.secure && !showPass}
                  />
                  {field.secure && (
                    <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.btnWrapper}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.btn}>
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  appName: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, letterSpacing: 2 },
  tagline: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  card: { backgroundColor: colors.bgCard, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgInput, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { height: 46, color: colors.textPrimary, fontSize: 15 },
  eyeBtn: { padding: 4 },
  btnWrapper: { marginTop: 8 },
  btn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.green, fontSize: 14, fontWeight: '600' },
});
