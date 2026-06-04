import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MODULES } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, IndianRupee, PartyPopper, BellRing, Check, CheckCheck, RefreshCw, Info } from 'lucide-react';

const typeIcons = { 
  booking: <Calendar size={20} />, 
  payment: <IndianRupee size={20} />, 
  event: <PartyPopper size={20} />, 
  system: <Info size={20} /> 
};

const typeColors = {
  booking: 'text-gray-800 bg-gray-100 border-gray-200',
  payment: 'text-gray-800 bg-gray-100 border-gray-200',
  event: 'text-gray-800 bg-gray-100 border-gray-200',
  system: 'text-gray-500 bg-gray-50 border-gray-200'
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.patch(`/api/notifications/${id}/read`);
    fetch();
  };

  const markAllRead = async () => {
    await api.patch('/api/notifications/read-all');
    toast.success('All marked as read');
    fetch();
  };

  const generateReminders = async () => {
    await api.post('/api/notifications/generate');
    toast.success('Reminders generated');
    fetch();
  };

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with system alerts and reminders</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateReminders} className="btn-outline flex items-center gap-2 text-sm bg-white">
            <RefreshCw size={16} />
            Generate Reminders
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-primary flex items-center gap-2 text-sm">
              <CheckCheck size={16} />
              Mark all read ({unread})
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`card-modern cursor-pointer flex gap-4 transition-all bg-white border ${
                !n.isRead ? 'border-black ring-1 ring-black/5 bg-gray-50/30' : 'opacity-60 border-gray-200'
              }`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border ${typeColors[n.type] || typeColors.system}`}>
                {typeIcons[n.type] || typeIcons.system}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(n.createdAt).toLocaleString()}</span>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-black animate-pulse" />}
                  </div>
                </div>
                <p className={`text-sm mt-1 ${!n.isRead ? 'text-gray-800' : 'text-gray-500'}`}>{n.message}</p>
                <div className="flex items-center gap-3 mt-3">
                  {n.module && (
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-700 bg-gray-100 px-2 py-0.5 border border-gray-200 rounded">
                      {MODULES[n.module]?.label}
                    </span>
                  )}
                  {n.priority === 'high' && (
                    <span className="text-[11px] font-bold uppercase tracking-wider text-black bg-gray-200 px-2 py-0.5 rounded border border-gray-300">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notifications.length === 0 && (
          <div className="card-modern py-16 text-center border-dashed border-2 border-gray-200 bg-white">
            <BellRing size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-900 font-semibold text-lg">You're all caught up!</p>
            <p className="text-sm text-gray-500 mt-1">No new notifications to show right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
