import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Percent, 
  BookOpen, Clock, ShieldCheck, User, Trophy, Camera, 
  Trees, Building2, CheckCircle, HelpCircle, XCircle, Plus, Wallet, FileText
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const MODULES_MAP = {
  cricket: { label: 'Cricket Ground', icon: Trophy, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  shooting: { label: 'Shooting Studio', icon: Camera, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  marriage: { label: 'Marriage Ground', icon: Trees, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  banquet: { label: 'Banquet Hall', icon: Building2, color: 'text-gray-900 bg-gray-100 border-gray-200' },
};

const PAYMENT_STATUS_COLORS = {
  Paid: 'bg-black text-white border-black',
  Pending: 'bg-gray-100 text-gray-500 border-gray-200',
  Partial: 'bg-gray-200 text-gray-800 border-gray-300',
};

export default function OwnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'Cash',
    notes: ''
  });

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        setLoading(true);
        const [res, paymentsRes] = await Promise.all([
          api.get(`/api/users/${id}`),
          api.get(`/api/owner-payments/${id}`)
        ]);
        setData(res.data.data);
        setPayments(paymentsRes.data.data);
      } catch (err) {
        toast.error('Failed to load owner profile details');
        navigate('/owners');
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerDetails();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { user, activity } = data;
  const pct = Number(user.ownershipPercentage) || 0;
  
  const getPartnerBadge = (percentage) => {
    if (percentage >= 40) return { text: 'Founder & Partner', color: 'bg-black text-white border-black font-semibold shadow-sm' };
    if (percentage > 0) return { text: 'Co-Owner / Partner', color: 'bg-gray-200 text-gray-800 border-gray-300 font-semibold' };
    return { text: 'Business Partner', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  };

  const badge = getPartnerBadge(pct);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/owner-payments', {
        ownerId: id,
        ...paymentForm
      });
      toast.success('Payment added successfully');
      setPayments([res.data.data, ...payments]);
      setData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          totalPaid: (prev.user.totalPaid || 0) + Number(paymentForm.amount)
        }
      }));
      setIsPaymentModalOpen(false);
      setPaymentForm({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: 'Cash',
        notes: ''
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/owners')} 
          className="p-2 rounded-lg bg-white border border-dark-border text-gray-500 hover:text-black hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Owner Profile
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Details and activity metrics for {user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Card Profile */}
        <div className="card-modern relative overflow-hidden flex flex-col items-center text-center p-6 lg:col-span-1 bg-white">
          <div className="absolute top-4 right-4">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${user.isActive ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center text-4xl font-bold text-gray-900 overflow-hidden shadow-sm mt-4">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-4 tracking-tight">{user.name}</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Owner & Partner</p>
          
          <div className="mt-3 flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold border bg-gray-50 border-dark-border">
            <ShieldCheck size={14} className="text-black" />
            <span>{badge.text}</span>
          </div>

          <div className="w-full mt-6 pt-6 border-t border-dark-border space-y-4 text-left text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-gray-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {(user.phone || user.mobile) && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>{user.phone || user.mobile}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats and Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-modern p-5 bg-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Total Investment</p>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{Number(user.totalInvestment || 0).toLocaleString('en-IN')}</h3>
            </div>
            <div className="card-modern p-5 bg-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Total Paid</p>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{Number(user.totalPaid || 0).toLocaleString('en-IN')}</h3>
            </div>
            <div className="card-modern p-5 bg-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Remaining</p>
              <h3 className="text-2xl font-extrabold text-gray-900">₹{Math.max(0, Number(user.totalInvestment || 0) - Number(user.totalPaid || 0)).toLocaleString('en-IN')}</h3>
            </div>
          </div>

          {/* Payment History Activity */}
          <div className="card-modern p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Wallet className="text-black" size={18} />
                Payment History
              </h3>
              {isSuperAdmin && (
                <button 
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Payment
                </button>
              )}
            </div>

            {payments.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No payment history recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-500 text-xs uppercase font-bold tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Added By</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="text-gray-700 hover:bg-gray-50 transition-colors group">
                        <td className="py-3.5 pr-3 font-semibold text-gray-900">
                          {new Date(payment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-200">
                            {payment.method}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-xs text-gray-500">
                          {payment.addedBy?.name || 'Admin'}
                        </td>
                        <td className="py-3.5 text-right font-bold text-gray-900">
                          ₹{payment.amount?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Add Owner Payment"
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Payment Date *</label>
              <input 
                type="date" 
                value={paymentForm.date} 
                onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} 
                className="input-modern" 
                required 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Amount (₹) *</label>
              <input 
                type="number" 
                value={paymentForm.amount} 
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} 
                className="input-modern" 
                required 
                min="1"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Payment Method *</label>
              <select 
                value={paymentForm.method} 
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value})} 
                className="input-modern"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Notes (Optional)</label>
              <textarea 
                value={paymentForm.notes} 
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} 
                className="input-modern h-20 resize-none" 
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-border mt-6">
            <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
