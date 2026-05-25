import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/constants';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

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
      const { data } = await api.get('/customers', { params: { search } });
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
      const { data } = await api.get(`/customers/${id}`);
      setDetail(data.data);
    } catch {
      toast.error('Failed to load customer');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', newCustomer);
      toast.success('Customer added');
      setShowAdd(false);
      setNewCustomer({ name: '', mobile: '', notes: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or mobile..."
          className="input-luxury flex-1"
        />
        <button onClick={() => setShowAdd(true)} className="btn-gold whitespace-nowrap">+ Add Customer</button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <button
              key={c._id}
              onClick={() => openDetail(c._id)}
              className="card-luxury text-left w-full hover:border-luxury-gold/50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-luxury-gold">{c.mobile}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">{c.totalBookings} bookings</p>
                  {c.pendingAmount > 0 && (
                    <p className="text-yellow-400">{formatCurrency(c.pendingAmount)} pending</p>
                  )}
                </div>
              </div>
            </button>
          ))}
          {customers.length === 0 && (
            <p className="text-center text-gray-500 py-8">No customers found</p>
          )}
        </div>
      )}

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Customer Profile" size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name</span><p>{detail.customer.name}</p></div>
              <div><span className="text-gray-500">Mobile</span><p>{detail.customer.mobile}</p></div>
              <div><span className="text-gray-500">Total Bookings</span><p>{detail.customer.totalBookings}</p></div>
              <div><span className="text-gray-500">Pending</span><p className="text-yellow-400">{formatCurrency(detail.customer.pendingAmount)}</p></div>
            </div>
            {detail.customer.notes && (
              <div><span className="text-gray-500 text-sm">Notes</span><p className="text-sm mt-1">{detail.customer.notes}</p></div>
            )}
            <h4 className="text-luxury-gold font-medium">Booking History</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {detail.bookingHistory?.map((b) => (
                <div key={b._id} className="p-3 bg-luxury-dark rounded-lg text-sm flex justify-between">
                  <span>{new Date(b.date).toLocaleDateString()} · {b.module}</span>
                  <span className={b.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-yellow-400'}>{b.paymentStatus}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <input className="input-luxury" placeholder="Name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
          <input className="input-luxury" placeholder="Mobile" value={newCustomer.mobile} onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })} required />
          <textarea className="input-luxury" placeholder="Notes" rows={3} value={newCustomer.notes} onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })} />
          <button type="submit" className="btn-gold w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
}
