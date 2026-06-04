import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { MODULES, formatCurrency, formatDate } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, IndianRupee, Clock, Users, ArrowRight, Receipt } from 'lucide-react';

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
    { label: "Today's Bookings", value: stats.todayCount, icon: Calendar, color: 'text-black', bg: 'bg-gray-100' },
    !isStaff && { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: IndianRupee, color: 'text-black', bg: 'bg-gray-100' },
    !isStaff && { label: 'Pending Payments', value: formatCurrency(stats.pendingAmount), icon: IndianRupee, color: 'text-black', bg: 'bg-gray-100 border border-gray-200' },
    { label: 'Pending Count', value: stats.pendingCount, icon: Users, color: 'text-black', bg: 'bg-gray-100' },
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
            className="card-modern bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color} border border-gray-200`}>
                <card.icon size={24} className="stroke-[1.75]" />
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
            className="lg:col-span-2 card-modern flex flex-col bg-white"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Weekly revenue performance across all modules</p>
            </div>
            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px' }}
                    itemStyle={{ color: '#111111' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fillOpacity={0.1} fill="#000000" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${isStaff ? 'lg:col-span-3' : ''} card-modern flex flex-col bg-white`}
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Venues</h2>
            <p className="text-sm text-gray-500">Current active venues</p>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {stats.moduleStats?.filter(m => !isStaff || user?.assignedModules?.includes(m.module)).map((m) => {
              const mod = MODULES[m.module];
              return (
                <Link
                  key={m.module}
                  to={`/module/${m.module}`}
                  className="flex-1 p-4 rounded-xl border border-dark-border bg-white group hover:border-black transition-colors flex items-center justify-between hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {mod?.icon && (
                      <div className="w-14 h-14 bg-white border border-dark-border rounded-xl flex items-center justify-center text-black group-hover:text-gray-500 transition-colors shrink-0">
                        <mod.icon size={28} className="stroke-[1.75]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors">
                        {m.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{m.todayStatus}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-black transition-colors" />
                </Link>
              );
            })}

            {!isStaff && (
              <Link
                to="/expenses"
                className="flex-1 p-4 rounded-xl border border-dark-border bg-white group hover:border-black transition-colors flex items-center justify-between hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border border-dark-border rounded-xl flex items-center justify-center text-black group-hover:text-gray-500 transition-colors shrink-0">
                    <Receipt size={28} className="stroke-[1.75]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors">
                      Expenses
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Today: {formatCurrency(stats.expenses?.today)} · Month: {formatCurrency(stats.expenses?.month)}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-gray-400 group-hover:text-black transition-colors" />
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-modern bg-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Upcoming Events</h3>
            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Next 7 days</span>
          </div>
          {stats.upcomingEvents?.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingEvents?.slice(0, 5).map((e) => (
                <div key={e._id} className="flex justify-between items-center text-sm p-3 rounded-lg border border-dark-border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-black" />
                    <span className="font-semibold text-gray-800">{e.customerName}</span>
                  </div>
                  <span className="text-gray-500 font-mono text-xs">{formatDate(e.date)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-modern bg-white"
        >
          <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
          {stats.recentActivity?.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity?.slice(0, 5).map((e) => (
                <div key={e._id} className="flex justify-between items-center text-sm p-3 rounded-lg border border-dark-border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <span className="font-semibold text-gray-800">{e.customerName}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{MODULES[e.module]?.label}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${e.paymentStatus === 'Paid' ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
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
