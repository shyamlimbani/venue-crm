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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Financial overview and business performance for {year}</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Total Events', value: analytics.total, icon: BarChart3, color: 'text-black', bg: 'bg-gray-100' },
            { label: 'Paid Bookings', value: analytics.paid, icon: CheckCircle, color: 'text-black', bg: 'bg-gray-100' },
            { label: 'Partial Payments', value: analytics.partial, icon: TrendingUp, color: 'text-black', bg: 'bg-gray-100 border border-gray-200' },
            { label: 'Pending Bookings', value: analytics.pending, icon: Clock, color: 'text-black', bg: 'bg-gray-100' },
          ].map((s, i) => (
            <motion.div 
              key={s.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-modern bg-white"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color} border border-gray-200`}>
                  <s.icon size={24} className="stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
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
          className="lg:col-span-2 card-modern flex flex-col bg-white"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Monthly Revenue ({year})</h2>
            <p className="text-sm text-gray-500">Total collected revenue per month</p>
          </div>
          <div className="h-80 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px' }}
                  itemStyle={{ color: '#111111' }}
                  cursor={{ fill: '#F3F4F6', opacity: 0.5 }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.revenue > 0 ? '#000000' : '#E5E7EB'} />
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
          className="card-modern bg-white"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Module</h2>
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
                      <span className="font-semibold text-gray-900">{m.label}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(m.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>{m.count} events</span>
                    <span>{formatCurrency(m.pending)} pending</span>
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
