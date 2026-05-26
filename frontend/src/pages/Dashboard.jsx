import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MODULES, formatCurrency, formatDate } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Clock, Users, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { isStaff, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!stats) return <p className="text-gray-500 text-center">Failed to load dashboard</p>;

  const statCards = [
    { label: "Today's Bookings", value: stats.todayCount, icon: Calendar, color: 'text-primary-light', bg: 'bg-primary/10' },
    !isStaff && { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    !isStaff && { label: 'Pending Payments', value: formatCurrency(stats.pendingAmount), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Pending Count', value: stats.pendingCount, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ].filter(Boolean);

  // Mock data for the chart since the backend might not return historical data yet
  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, i) => (
          <motion.div 
            key={card.label} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-modern"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold text-white`}>{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {!isStaff && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-modern flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <p className="text-sm text-gray-400">Weekly revenue performance across all modules</p>
          </div>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#F9FAFB' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${isStaff ? 'lg:col-span-3' : ''} card-modern flex flex-col`}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Venues</h2>
            <p className="text-sm text-gray-400">Current active venues</p>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {stats.moduleStats?.filter(m => !isStaff || user?.assignedModules?.includes(m.module)).map((m) => {
              const mod = MODULES[m.module];
              return (
                <Link
                  key={m.module}
                  to={`/module/${m.module}`}
                  className={`flex-1 p-4 rounded-xl border border-dark-border bg-gradient-to-br ${mod?.color || ''} group hover:border-primary/50 transition-colors flex items-center justify-between`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl bg-white/5 p-2 rounded-lg">{mod?.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-primary-light transition-colors">
                        {m.label}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{m.todayStatus}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-500 group-hover:text-primary-light transition-colors" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Events</h3>
            <span className="text-xs font-medium text-primary-light bg-primary/10 px-2 py-1 rounded-md">Next 7 days</span>
          </div>
          {stats.upcomingEvents?.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingEvents?.slice(0, 5).map((e) => (
                <div key={e._id} className="flex justify-between items-center text-sm p-3 rounded-lg border border-dark-border bg-slate-900/50 hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium text-gray-200">{e.customerName}</span>
                  </div>
                  <span className="text-gray-400 font-mono text-xs">{formatDate(e.date)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-modern"
        >
          <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
          {stats.recentActivity?.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity?.slice(0, 5).map((e) => (
                <div key={e._id} className="flex justify-between items-center text-sm p-3 rounded-lg border border-dark-border bg-slate-900/50 hover:bg-slate-800 transition-colors">
                  <div>
                    <span className="font-medium text-gray-200">{e.customerName}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{MODULES[e.module]?.label}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${e.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {e.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
