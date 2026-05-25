import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function BookingForm({ module, initial, defaultDate, onSuccess, onCancel }) {
  const [config, setConfig] = useState({ slots: [], bookingTypes: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    timeSlot: '',
    bookingType: '',
    shootCategory: '',
    guestCount: '',
    decorationNotes: '',
    eventNotes: '',
    totalAmount: '',
    advanceAmount: '',
    notes: '',
  });

  useEffect(() => {
    api.get(`/calendar/config/${module}`).then(({ data }) => setConfig(data.data));
  }, [module]);

  useEffect(() => {
    if (initial) {
      setForm({
        customerName: initial.customerName || '',
        mobile: initial.mobile || '',
        date: new Date(initial.date).toISOString().split('T')[0],
        timeSlot: initial.timeSlot || '',
        bookingType: initial.bookingType || '',
        shootCategory: initial.shootCategory || '',
        guestCount: initial.guestCount || '',
        decorationNotes: initial.decorationNotes || '',
        eventNotes: initial.eventNotes || '',
        totalAmount: initial.totalAmount || '',
        advanceAmount: initial.advanceAmount || '',
        notes: initial.notes || '',
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === 'totalAmount' || name === 'advanceAmount') {
      const total = name === 'totalAmount' ? Number(value) : Number(form.totalAmount);
      const adv = name === 'advanceAmount' ? Number(value) : Number(form.advanceAmount);
      // remaining shown in UI if needed
    }
  };

  const remaining = Math.max(0, Number(form.totalAmount || 0) - Number(form.advanceAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.mobile || !form.date || !form.timeSlot || !form.totalAmount) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        module,
        totalAmount: Number(form.totalAmount),
        advanceAmount: Number(form.advanceAmount || 0),
        guestCount: Number(form.guestCount || 0),
      };
      if (initial?._id) {
        await api.put(`/bookings/${initial._id}`, payload);
        toast.success('Booking updated');
      } else {
        await api.post('/bookings', payload);
        toast.success('Booking created');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Customer Name *</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Mobile Number *</label>
          <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date *</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Time Slot *</label>
          <select name="timeSlot" value={form.timeSlot} onChange={handleChange} className="input-luxury" required>
            <option value="">Select slot</option>
            {config.slots?.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {module === 'shooting' && (
          <div className="sm:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Shoot Category</label>
            <select name="shootCategory" value={form.shootCategory} onChange={handleChange} className="input-luxury">
              <option value="">Select category</option>
              {config.categories?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {(module === 'banquet' || module === 'marriage') && config.bookingTypes?.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Booking Type</label>
            <select name="bookingType" value={form.bookingType} onChange={handleChange} className="input-luxury">
              <option value="">Select type</option>
              {config.bookingTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        {module === 'marriage' && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Guest Count</label>
              <input name="guestCount" type="number" value={form.guestCount} onChange={handleChange} className="input-luxury" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Decoration Notes</label>
              <textarea name="decorationNotes" value={form.decorationNotes} onChange={handleChange} className="input-luxury min-h-[80px]" rows={2} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Event Notes</label>
              <textarea name="eventNotes" value={form.eventNotes} onChange={handleChange} className="input-luxury min-h-[80px]" rows={2} />
            </div>
          </>
        )}

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Total Amount *</label>
          <input name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} className="input-luxury" required />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Advance Payment</label>
          <input name="advanceAmount" type="number" value={form.advanceAmount} onChange={handleChange} className="input-luxury" />
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-gray-400">Remaining: <span className="text-luxury-gold font-semibold">₹{remaining}</span></p>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-500 mb-1 block">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="input-luxury min-h-[80px]" rows={2} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-gold flex-1">
          {loading ? 'Saving...' : initial ? 'Update Booking' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
}
