import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency, formatDate, MODULES, PAYMENT_COLORS } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';

export default function Payments() {
  const [pending, setPending] = useState({ bookings: [], totalPending: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/reports/pending-payments'),
      api.get('/reports/payments'),
    ])
      .then(([p, h]) => {
        setPending(p.data.data);
        setHistory(h.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePartialPay = async () => {
    try {
      await api.patch(`/bookings/${payModal._id}/payment`, { amount: Number(amount) });
      toast.success('Payment recorded');
      setPayModal(null);
      const { data } = await api.get('/reports/pending-payments');
      setPending(data.data);
    } catch {
      toast.error('Payment failed');
    }
  };

  if (loading) return <LoadingSpinner className="py-24" size="lg" />;

  return (
    <div className="space-y-6">
      <div className="card-luxury bg-gradient-to-r from-yellow-900/20 to-luxury-card">
        <p className="text-sm text-gray-500">Total Pending</p>
        <p className="text-3xl font-bold text-yellow-400">{formatCurrency(pending.totalPending)}</p>
        <p className="text-sm text-gray-500 mt-1">{pending.count} bookings with balance</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-luxury-gold mb-3">Pending Payments</h2>
        <div className="space-y-3">
          {pending.bookings?.map((b) => (
            <div key={b._id} className="card-luxury flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">{b.customerName}</h3>
                <p className="text-sm text-gray-500">{MODULES[b.module]?.label} · {formatDate(b.date)}</p>
                <p className="text-sm">Remaining: <span className="text-yellow-400">{formatCurrency(b.remainingAmount)}</span></p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded border self-start ${PAYMENT_COLORS[b.paymentStatus]}`}>{b.paymentStatus}</span>
                <button onClick={() => { setPayModal(b); setAmount(String(b.remainingAmount)); }} className="btn-gold text-sm min-h-[40px]">
                  Record Payment
                </button>
              </div>
            </div>
          ))}
          {pending.bookings?.length === 0 && <p className="text-gray-500 text-center py-6">All payments cleared!</p>}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-luxury-gold mb-3">Payment History</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((p) => (
            <div key={p._id} className="flex justify-between text-sm p-3 bg-luxury-card rounded-lg border border-luxury-border">
              <span>{p.booking?.customerName || '—'} · {formatCurrency(p.amount)}</span>
              <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment">
        <p className="text-sm text-gray-400 mb-4">Remaining: {formatCurrency(payModal?.remainingAmount)}</p>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-luxury mb-4" max={payModal?.remainingAmount} />
        <button onClick={handlePartialPay} className="btn-gold w-full">Submit Payment</button>
      </Modal>
    </div>
  );
}
