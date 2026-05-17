import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, MapPin, Zap, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    preferences: {
      location: user?.preferences?.location || 'New York',
      temperatureUnit: user?.preferences?.temperatureUnit || 'celsius',
      notifications: user?.preferences?.notifications ?? true,
      energyGoal: user?.preferences?.energyGoal || 100,
    },
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) return toast.error('Passwords do not match');
    if (passwordForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border border-slate-700"
      >
        <div className="flex items-center gap-2 mb-5">
          <User size={18} className="text-emerald-400" />
          <h3 className="text-white font-semibold">Profile Information</h3>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <p className="text-slate-500 text-xs mt-0.5">Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">
                <MapPin size={12} className="inline mr-1" />Location
              </label>
              <input
                type="text"
                value={profileForm.preferences.location}
                onChange={(e) => setProfileForm({ ...profileForm, preferences: { ...profileForm.preferences, location: e.target.value } })}
                placeholder="City name"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Temperature Unit</label>
              <select
                value={profileForm.preferences.temperatureUnit}
                onChange={(e) => setProfileForm({ ...profileForm, preferences: { ...profileForm.preferences, temperatureUnit: e.target.value } })}
                className={inputClass}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              <Zap size={12} className="inline mr-1" />Monthly Energy Goal (kWh)
            </label>
            <input
              type="number"
              value={profileForm.preferences.energyGoal}
              onChange={(e) => setProfileForm({ ...profileForm, preferences: { ...profileForm.preferences, energyGoal: parseInt(e.target.value) } })}
              min="10"
              max="1000"
              className={inputClass}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-slate-400" />
              <div>
                <p className="text-white text-sm font-medium">Push Notifications</p>
                <p className="text-slate-500 text-xs">Receive alerts and automation updates</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setProfileForm({ ...profileForm, preferences: { ...profileForm.preferences, notifications: !profileForm.preferences.notifications } })}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${profileForm.preferences.notifications ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${profileForm.preferences.notifications ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary disabled:opacity-50">
            <Save size={16} />
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 border border-slate-700"
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-blue-400" />
          <h3 className="text-white font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword', placeholder: 'Enter current password' },
            { label: 'New Password', key: 'newPassword', placeholder: 'Min. 6 characters' },
            { label: 'Confirm New Password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">{field.label}</label>
              <input
                type="password"
                value={passwordForm[field.key]}
                onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </div>
          ))}

          <button type="submit" disabled={savingPassword} className="btn-primary disabled:opacity-50">
            <Lock size={16} />
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 border border-slate-700"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">ECOGENIE v1.0.0</p>
            <p className="text-slate-500 text-xs">AI-Driven Smart Energy Optimization Platform</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Rooms', value: '4' },
            { label: 'Appliances', value: '16' },
            { label: 'Automation Rules', value: '4' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
