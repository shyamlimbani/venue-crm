import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { MODULES, formatCurrency, formatDate } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!stats) return <p className="text-gray-500 text-center">Failed to load dashboard</p>;

  const statCards = [
    { label: "Today's Bookings", value: stats.todayCount, icon: '📅', color: 'text-blue-400' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: '💰', color: 'text-luxury-gold' },
    { label: 'Pending Payments', value: formatCurrency(stats.pendingAmount), icon: '⏳', color: 'text-yellow-400' },
    { label: 'Pending Count', value: stats.pendingCount, icon: '📋', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-luxury">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-luxury-gold mb-3">Business Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.moduleStats?.map((m) => {
            const mod = MODULES[m.module];
            return (
              <Link
                key={m.module}
                to={`/module/${m.module}`}
                className={`card-luxury bg-gradient-to-br ${mod?.color || ''} group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{mod?.icon}</span>
                  <span className="text-xs text-gray-500">{m.totalBookings} total</span>
                </div>
                <h3 className="font-semibold text-white group-hover:text-luxury-gold transition-colors">
                  {m.label}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{m.todayStatus}</p>
                <span className="inline-block mt-4 text-sm text-luxury-gold">Open Module →</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-luxury">
          <h3 className="font-semibold text-luxury-gold mb-3">Upcoming Events</h3>
          {stats.upcomingEvents?.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming events</p>
          ) : (
            <ul className="space-y-2">
              {stats.upcomingEvents?.slice(0, 5).map((e) => (
                <li key={e._id} className="flex justify-between text-sm border-b border-luxury-border/50 pb-2">
                  <span>{e.customerName}</span>
                  <span className="text-gray-500">{formatDate(e.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-luxury">
          <h3 className="font-semibold text-luxury-gold mb-3">Recent Activity</h3>
          {stats.recentActivity?.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentActivity?.slice(0, 5).map((e) => (
                <li key={e._id} className="flex justify-between text-sm border-b border-luxury-border/50 pb-2">
                  <span>{e.customerName} · {MODULES[e.module]?.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${e.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {e.paymentStatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {stats.todayBookings?.length > 0 && (
        <div className="card-luxury">
          <h3 className="font-semibold text-luxury-gold mb-3">Today's Bookings</h3>
          <div className="space-y-2">
            {stats.todayBookings.map((b) => (
              <div key={b._id} className="flex justify-between items-center text-sm py-2 border-b border-luxury-border/30">
                <div>
                  <p className="font-medium">{b.customerName}</p>
                  <p className="text-gray-500">{MODULES[b.module]?.label} · {b.timeSlot}</p>
                </div>
                <span className="text-luxury-gold">{b.paymentStatus}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
