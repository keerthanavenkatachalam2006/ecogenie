import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SEVERITY_COLORS = {
  low: 'border-l-blue-400 bg-blue-500/5',
  medium: 'border-l-yellow-400 bg-yellow-500/5',
  high: 'border-l-orange-400 bg-orange-500/5',
  critical: 'border-l-red-400 bg-red-500/5',
};

const TYPE_ICONS = {
  overheating: '🌡️',
  energy_excess: '⚡',
  appliance_fault: '⚠️',
  automation: '🤖',
  system: '🔧',
  info: 'ℹ️',
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, fetchNotifications, setNotifications, setUnreadCount } = useEnergy();

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark notifications');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-emerald-400" />
                <span className="font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors" title="Mark all read">
                    <CheckCheck size={16} />
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <Bell size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-xl border-l-4 ${SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.low} ${
                      !notif.isRead ? 'ring-1 ring-slate-600' : 'opacity-70'
                    } cursor-pointer`}
                    onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="text-base flex-shrink-0">{TYPE_ICONS[notif.type] || 'ℹ️'}</span>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{notif.title}</p>
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-slate-600 text-xs mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notif._id); }}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full absolute right-3 top-3" />
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
