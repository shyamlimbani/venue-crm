import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, MODULES } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function Reports() {
  const [monthly, setMonthly] = useState([]);
  const [moduleRev, setModuleRev] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      api.get('/api/reports/monthly-revenue', { params: { year } }),
      api.get('/api/reports/module-revenue'),
      api.get('/api/reports/analytics'),
    ])
      .then(([m, mod, a]) => {
        setMonthly(m.data.data.monthly);
        setModuleRev(mod.data.data);
        setAnalytics(a.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Format data for recharts
  const chartData = monthly.map((m, i) => ({
    name: months[i],
    revenue: m.revenue
  }));

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Financial overview and business performance for {year}</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Events', value: analytics.total, icon: BarChart3, color: 'text-primary-light', bg: 'bg-primary/10' },
            { label: 'Paid Bookings', value: analytics.paid, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Partial Payments', value: analytics.partial, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Pending Bookings', value: analytics.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-modern"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-white mt-0.5">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card-modern flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Monthly Revenue ({year})</h2>
            <p className="text-sm text-gray-400">Total collected revenue per month</p>
          </div>
          <div className="h-80 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#F9FAFB' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#2563EB' : '#374151'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-modern"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Revenue by Module</h2>
          <div className="space-y-5">
            {moduleRev.map((m) => {
              const mod = MODULES[m.module];
              const totalRevenue = moduleRev.reduce((s, x) => s + x.revenue, 0) || 1;
              const percent = Math.min(100, (m.revenue / totalRevenue) * 100);
              
              return (
                <div key={m.module}>
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span>{mod?.icon}</span>
                      <span className="font-medium text-gray-200">{m.label}</span>
                    </div>
                    <span className="font-semibold text-white">{formatCurrency(m.revenue)}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{m.count} events</span>
                    <span className="text-amber-500/80">{formatCurrency(m.pending)} pending</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
