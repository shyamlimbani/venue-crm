import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MODULES } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const typeIcons = { booking: '📅', payment: '₹', event: '🎉', system: '◈' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    fetch();
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    toast.success('All marked as read');
    fetch();
  };

  const generateReminders = async () => {
    await api.post('/notifications/generate');
    toast.success('Reminders generated');
    fetch();
  };

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={generateReminders} className="btn-gold text-sm">Generate Reminders</button>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-outline text-sm">Mark all read ({unread})</button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => !n.isRead && markRead(n._id)}
            className={`card-luxury cursor-pointer ${!n.isRead ? 'border-luxury-gold/40' : 'opacity-70'}`}
          >
            <div className="flex gap-3">
              <span className="text-2xl">{typeIcons[n.type] || '◈'}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-sm">{n.title}</h3>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-luxury-gold animate-pulse-gold" />}
                </div>
                <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                <div className="flex gap-2 mt-2 text-xs text-gray-600">
                  {n.module && <span>{MODULES[n.module]?.label}</span>}
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                  {n.priority === 'high' && <span className="text-red-400">High</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-gray-500 py-12">No notifications</p>
        )}
      </div>
    </div>
  );
}
