import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, MODULES } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Reports() {
  const [monthly, setMonthly] = useState([]);
  const [moduleRev, setModuleRev] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      api.get('/reports/monthly-revenue', { params: { year } }),
      api.get('/reports/module-revenue'),
      api.get('/reports/analytics'),
    ])
      .then(([m, mod, a]) => {
        setMonthly(m.data.data.monthly);
        setModuleRev(mod.data.data);
        setAnalytics(a.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  return (
    <div className="space-y-6">
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active', value: analytics.total },
            { label: 'Paid', value: analytics.paid, color: 'text-emerald-400' },
            { label: 'Partial', value: analytics.partial, color: 'text-blue-400' },
            { label: 'Pending', value: analytics.pending, color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="card-luxury text-center">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color || 'text-white'}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card-luxury">
        <h3 className="font-semibold text-luxury-gold mb-4">Monthly Revenue ({year})</h3>
        <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
          {monthly.map((m, i) => (
            <div key={m.month} className="flex flex-col items-center flex-1 min-w-[24px]">
              <div
                className="w-full bg-luxury-gold/80 rounded-t transition-all min-h-[4px]"
                style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                title={formatCurrency(m.revenue)}
              />
              <span className="text-[10px] text-gray-500 mt-1">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-luxury">
        <h3 className="font-semibold text-luxury-gold mb-4">Module-wise Revenue</h3>
        <div className="space-y-3">
          {moduleRev.map((m) => (
            <div key={m.module} className="flex items-center gap-4">
              <span className="text-xl w-8">{MODULES[m.module]?.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>{m.label}</span>
                  <span className="text-luxury-gold">{formatCurrency(m.revenue)}</span>
                </div>
                <div className="h-2 bg-luxury-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-luxury-gold rounded-full"
                    style={{ width: `${Math.min(100, (m.revenue / (moduleRev.reduce((s, x) => s + x.revenue, 0) || 1)) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{m.count} bookings · {formatCurrency(m.pending)} pending</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
