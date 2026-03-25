import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Bell, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState<'password' | 'notifications' | 'preferences'>('password');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [notifications, setNotifications] = useState({ orders: true, promotions: false, updates: true });
  const handlePasswordSave = () => {
    if (!passwords.old || !passwords.new) return toast.error('Fill in all fields');
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Password must be at least 6 characters');
    toast.success('Password updated!');
    setPasswords({ old: '', new: '', confirm: '' });
  };

  const tabs = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Moon },
  ] as const;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-700 dark:to-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 pt-4 space-x-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                    tab === t.id
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 -mb-px'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <t.icon size={14} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-4">
              {/* Password Tab */}
              {tab === 'password' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  <PasswordField label="Current Password" value={passwords.old} show={showOld}
                    onToggle={() => setShowOld(!showOld)} onChange={(v) => setPasswords({ ...passwords, old: v })} />
                  <PasswordField label="New Password" value={passwords.new} show={showNew}
                    onToggle={() => setShowNew(!showNew)} onChange={(v) => setPasswords({ ...passwords, new: v })} />
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
                    <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePasswordSave}
                    className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-primary-500/40 transition-all duration-200">
                    Update Password
                  </motion.button>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {tab === 'notifications' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  {([
                    { key: 'orders', label: 'Order Updates', desc: 'Get notified about your order status' },
                    { key: 'promotions', label: 'Promotions', desc: 'Deals, discounts and offers' },
                    { key: 'updates', label: 'App Updates', desc: 'New features and announcements' },
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                      </div>
                      <Toggle checked={notifications[item.key]} onChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Preferences Tab */}
              {tab === 'preferences' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  {/* Dark mode */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-2">
                      {isDark ? <Moon size={16} className="text-primary-400" /> : <Sun size={16} className="text-yellow-500" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{isDark ? 'Currently dark' : 'Currently light'}</p>
                      </div>
                    </div>
                    <Toggle checked={isDark} onChange={toggleTheme} />
                  </div>


                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PasswordField({ label, value, show, onToggle, onChange }: {
  label: string; value: string; show: boolean; onToggle: () => void; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
