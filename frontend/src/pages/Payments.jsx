import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDate, MODULES, PAYMENT_COLORS } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, CheckCircle2 } from 'lucide-react';

export default function Payments() {
  const [pending, setPending] = useState({ bookings: [], totalPending: 0, count: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/reports/pending-payments'),
      api.get('/api/reports/payments'),
    ])
      .then(([p, h]) => {
        setPending(p.data.data);
        setHistory(h.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePartialPay = async () => {
    try {
      await api.patch(`/api/bookings/${payModal._id}/payment`, { amount: Number(amount) });
      toast.success('Payment recorded');
      setPayModal(null);
      const { data } = await api.get('/api/reports/pending-payments');
      setPending(data.data);
    } catch {
      toast.error('Payment failed');
    }
  };

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments & Revenue</h1>
        <p className="text-sm text-gray-500 mt-1">Manage outstanding dues and track revenue history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-modern bg-gray-50 border-gray-200 md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-black text-white shadow-sm border border-black">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Outstanding</p>
              <p className="text-4xl font-bold text-gray-900 mt-1">{formatCurrency(pending.totalPending)}</p>
              <p className="text-sm text-gray-500 mt-1">{pending.count} bookings require attention</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Action Required</h2>
            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-semibold border border-gray-200">
              {pending.bookings?.length || 0} Pending
            </span>
          </div>
          
          <div className="space-y-3">
            {pending.bookings?.map((b, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }}
                key={b._id} 
                className="card-modern p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-black"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{b.customerName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{MODULES[b.module]?.label} · {formatDate(b.date)}</p>
                  <p className="text-sm mt-2 text-gray-600">
                    Balance: <span className="text-gray-950 font-bold">{formatCurrency(b.remainingAmount)}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${PAYMENT_COLORS[b.paymentStatus]}`}>
                    {b.paymentStatus}
                  </span>
                  <button 
                    onClick={() => { setPayModal(b); setAmount(String(b.remainingAmount)); }} 
                    className="btn-primary py-1.5 px-3 text-xs w-full sm:w-auto mt-1"
                  >
                    Record Payment
                  </button>
                </div>
              </motion.div>
            ))}
            {pending.bookings?.length === 0 && (
              <div className="card-modern bg-white py-12 text-center border-dashed border-2">
                <CheckCircle2 size={40} className="mx-auto text-black mb-3" />
                <p className="text-gray-900 font-medium">All clear!</p>
                <p className="text-sm text-gray-500 mt-1">There are no outstanding payments.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="card-modern p-0 bg-white overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto divide-y divide-dark-border">
              {history.map((p, i) => (
                <div key={p._id} className="flex justify-between items-center text-sm p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-black border border-gray-250">
                      <IndianRupee size={16} className="stroke-[1.75]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.booking?.customerName || 'Unknown Customer'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">+{formatCurrency(p.amount)}</span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="p-8 text-center text-gray-500">No recent transactions.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-dark-border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Customer</p>
            <p className="font-bold text-gray-900">{payModal?.customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Remaining</p>
            <p className="font-extrabold text-black">{formatCurrency(payModal?.remainingAmount)}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 font-medium">₹</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="input-modern pl-8" 
                max={payModal?.remainingAmount} 
                min="1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter the amount received from the customer.</p>
          </div>
          <div className="pt-4 flex gap-3">
            <button onClick={() => setPayModal(null)} className="btn-outline flex-1">Cancel</button>
            <button onClick={handlePartialPay} className="btn-primary flex-1">Confirm Payment</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
