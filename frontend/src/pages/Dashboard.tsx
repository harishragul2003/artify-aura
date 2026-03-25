import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Camera, Save, X, Edit2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savedForm, setSavedForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setSavedForm({ ...form });
    setPendingAvatar(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({ ...savedForm });
    setPendingAvatar(null);
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: { name?: string; phone?: string; avatar_url?: string } = {
        name: form.name,
        phone: form.phone,
      };
      if (pendingAvatar) payload.avatar_url = pendingAvatar;

      const { data } = await userAPI.updateProfile(payload);
      updateUser(data);
      setSavedForm({ name: data.name, phone: data.phone || '' });
      setPendingAvatar(null);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = pendingAvatar || user?.avatar_url;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05, x: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 mb-5 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-primary-100 dark:border-primary-900 overflow-hidden"
      >
        <div className="h-28 bg-gradient-to-r from-primary-500 to-accent-500 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-14 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                {displayAvatar
                  ? <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-white">{getInitials()}</span>
                }
              </div>
              {editing && (
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1">
                  <Camera size={18} className="text-white" />
                  <span className="text-white text-[10px] font-medium">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              )}
            </div>

            <div className="flex space-x-2">
              {editing ? (
                <>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={saving}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 disabled:opacity-60">
                    <Save size={15} /><span>{saving ? 'Saving...' : 'Save'}</span>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all duration-200">
                    <X size={15} /><span>Cancel</span>
                  </motion.button>
                </>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleEdit}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-primary-100 dark:hover:bg-gray-600 transition-all duration-200">
                  <Edit2 size={15} /><span>Edit Profile</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
            <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            }`}>
              {user?.role === 'admin' ? '👑 Admin' : '🛍️ Customer'}
            </span>
          </div>

          <div className="space-y-3">
            <Field icon={<User size={16} />} label="Full Name" value={form.name} editing={editing} onChange={(v) => setForm({ ...form, name: v })} />
            <Field icon={<Mail size={16} />} label="Email Address" value={user?.email || ''} editing={false} onChange={() => {}} />
            <Field icon={<Phone size={16} />} label="Phone Number" value={form.phone || ''} placeholder="Add phone number" editing={editing} onChange={(v) => setForm({ ...form, phone: v })} />
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon, label, value, editing, onChange, placeholder }: {
  icon: React.ReactNode; label: string; value: string; editing: boolean; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
      <div className="text-primary-500 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        {editing
          ? <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
              className="w-full text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-primary-400 focus:outline-none focus:border-primary-600 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600" />
          : <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value || '—'}</p>
        }
      </div>
    </div>
  );
}
