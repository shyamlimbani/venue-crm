import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Search, Plus, Phone, User as UserIcon, Calendar, DollarSign, FileText } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', mobile: '', notes: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/customers', { params: { search } });
      setCustomers(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openDetail = async (id) => {
    try {
      const { data } = await api.get(`/api/customers/${id}`);
      setDetail(data.data);
    } catch {
      toast.error('Failed to load customer');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/customers', newCustomer);
      toast.success('Customer added');
      setShowAdd(false);
      setNewCustomer({ name: '', mobile: '', notes: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customers</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your customer database and booking history</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary whitespace-nowrap flex items-center gap-2">
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="card-modern p-4">
        <div className="flex items-center gap-3 bg-slate-900 border border-dark-border rounded-lg px-4 py-2 mb-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or mobile..."
            className="bg-transparent border-none focus:outline-none text-white w-full py-1.5 placeholder-gray-500"
          />
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-dark-border">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-900/50 text-gray-400 border-b border-dark-border">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Bookings</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {customers.map((c) => (
                  <tr 
                    key={c._id} 
                    onClick={() => openDetail(c._id)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary-light font-medium">
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-white group-hover:text-primary-light transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{c.mobile}</td>
                    <td className="px-6 py-4 text-gray-300">{c.totalBookings} events</td>
                    <td className="px-6 py-4">
                      {c.pendingAmount > 0 ? (
                        <span className="text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full font-medium text-xs">
                          {formatCurrency(c.pendingAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full font-medium text-xs">Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No customers found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Customer Profile" size="lg">
        {detail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-dark-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary-light text-xl font-bold border border-primary/20">
                {detail.customer.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{detail.customer.name}</h3>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <Phone size={14} /> {detail.customer.mobile}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="card-modern p-4 bg-slate-900/50">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Total Bookings</span>
                </div>
                <p className="text-2xl font-bold text-white">{detail.customer.totalBookings}</p>
              </div>
              <div className="card-modern p-4 bg-slate-900/50">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <DollarSign size={16} />
                  <span className="text-sm font-medium">Pending Dues</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">{formatCurrency(detail.customer.pendingAmount)}</p>
              </div>
            </div>

            {detail.customer.notes && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-dark-border">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <FileText size={16} />
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <p className="text-sm text-gray-300">{detail.customer.notes}</p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-white mb-3">Booking History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {detail.bookingHistory?.map((b) => (
                  <div key={b._id} className="p-3 bg-slate-900/80 rounded-lg border border-dark-border text-sm flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-200">{b.module}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(b.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                      {b.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Full Name</label>
            <input className="input-modern" placeholder="e.g. John Doe" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Mobile Number</label>
            <input className="input-modern" placeholder="e.g. +91 9876543210" value={newCustomer.mobile} onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Additional Notes (Optional)</label>
            <textarea className="input-modern" placeholder="Any preferences or details..." rows={3} value={newCustomer.notes} onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })} />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Save Customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
