import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, FileBarChart2, TrendingDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { formatCurrency } from '../utils/constants';

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const QUARTER_NAMES = ['', 'Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'];

export default function ExpenseReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/expenses/reports', { params: { year } });
      setReportData(data.data);
    } catch (err) {
      console.error('Failed to load expense report aggregates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [year]);

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;
  if (!reportData) return <p className="text-gray-500 text-center py-12">Failed to load reports.</p>;

  // Format data for Recharts
  // 1. Monthly
  const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i + 1;
    const match = reportData.monthly.find(m => m._id === monthIndex);
    return {
      name: MONTH_NAMES[monthIndex],
      amount: match ? match.total : 0,
      count: match ? match.count : 0
    };
  });

  // 2. Quarterly
  const quarterlyChartData = Array.from({ length: 4 }, (_, i) => {
    const quarterIndex = i + 1;
    const match = reportData.quarterly.find(q => q._id === quarterIndex);
    return {
      name: QUARTER_NAMES[quarterIndex],
      amount: match ? match.total : 0,
      count: match ? match.count : 0
    };
  });

  // 3. Yearly
  const yearlyChartData = reportData.yearly.map(y => ({
    name: String(y._id),
    amount: y.total,
    count: y.count
  }));

  // 4. Category breakdown
  const categoryChartData = reportData.category.map(c => ({
    name: c._id,
    amount: c.total,
    count: c.count
  }));

  // Calculate stats
  const totalPeriodExpense = (activeTab === 'monthly' ? monthlyChartData : activeTab === 'quarterly' ? quarterlyChartData : yearlyChartData)
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPeriodTransactions = (activeTab === 'monthly' ? monthlyChartData : activeTab === 'quarterly' ? quarterlyChartData : yearlyChartData)
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/expenses')} 
          className="p-2 rounded-lg bg-white border border-gray-250 text-gray-500 hover:text-black hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <FileBarChart2 className="text-black" />
            Expense Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Aggregate spending trends and category allocations</p>
        </div>
      </div>

      {/* Select Period Filters */}
      <div className="card-modern bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-gray-150 rounded-lg w-fit border border-gray-200 shadow-inner">
          {[
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'yearly', label: 'Yearly' }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${activeTab === t.id ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:text-black hover:bg-gray-200/50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab !== 'yearly' && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <select 
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="input-modern min-h-0 py-1.5 px-3 max-w-[120px] text-xs bg-white border-gray-200"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
        )}
      </div>

      {/* Aggregate summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-modern bg-white p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Period Expense</p>
            <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(totalPeriodExpense)}</p>
          </div>
          <div className="p-3 bg-gray-50 text-black border border-gray-250 rounded-lg">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="card-modern bg-white p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Period Transactions</p>
            <p className="text-3xl font-extrabold text-gray-900">{totalPeriodTransactions} records</p>
          </div>
          <div className="p-3 bg-gray-50 text-black border border-gray-250 rounded-lg">
            <Calendar size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 card-modern bg-white flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight capitalize">
              {activeTab} Spending Trend
            </h2>
            <p className="text-sm text-gray-500">Expenditure flow across the selected period</p>
          </div>
          <div className="h-80 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={
                  activeTab === 'monthly' 
                    ? monthlyChartData 
                    : activeTab === 'quarterly' 
                      ? quarterlyChartData 
                      : yearlyChartData
                } 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px' }}
                  itemStyle={{ color: '#111111' }}
                  cursor={{ fill: '#F3F4F6', opacity: 0.5 }}
                  formatter={(value) => [formatCurrency(value), 'Expenses']}
                />
                <Bar dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]}>
                  {(activeTab === 'monthly' ? monthlyChartData : activeTab === 'quarterly' ? quarterlyChartData : yearlyChartData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#000000' : '#E5E7EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-modern bg-white flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Category Allocation</h2>
            <p className="text-sm text-gray-500">Expenses distributed by category ({year})</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[320px] pr-2">
            {categoryChartData.map((c) => {
              const totalAlloc = categoryChartData.reduce((sum, item) => sum + item.amount, 0) || 1;
              const percent = Math.min(100, (c.amount / totalAlloc) * 100);
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="font-semibold text-gray-800">{c.name}</span>
                    <span className="font-bold text-gray-950">{formatCurrency(c.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>{c.count} records</span>
                    <span>{percent.toFixed(1)}% share</span>
                  </div>
                </div>
              );
            })}
            {categoryChartData.length === 0 && (
              <p className="text-gray-500 text-xs text-center py-12">No category allocations found.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
