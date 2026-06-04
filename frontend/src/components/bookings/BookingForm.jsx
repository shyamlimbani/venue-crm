import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

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
    startTime: '',
    endTime: '',
    peopleCount: '',
  });

  useEffect(() => {
    api.get(`/api/calendar/config/${module}`).then(({ data }) => setConfig(data.data));
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
        startTime: initial.startTime || '',
        endTime: initial.endTime || '',
        peopleCount: initial.peopleCount || '',
      });
    }
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const remaining = Math.max(0, Number(form.totalAmount || 0) - Number(form.advanceAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.mobile || !form.date || !form.totalAmount) {
      toast.error('Please fill required fields');
      return;
    }
    if (module === 'shooting' && (!form.startTime || !form.endTime)) {
      toast.error('Please enter Start Time and End Time');
      return;
    }
    if ((module === 'marriage' || module === 'banquet') && !form.bookingType) {
      toast.error('Please select a Booking Type');
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
        peopleCount: Number(form.peopleCount || 0),
      };

      if (module === 'cricket') {
        payload.timeSlot = 'all-day';
      } else if (module === 'shooting') {
        payload.timeSlot = `${form.startTime} - ${form.endTime}`;
      } else if (module === 'marriage' || module === 'banquet') {
        payload.timeSlot = form.bookingType;
      }

      if (initial?._id) {
        await api.put(`/api/bookings/${initial._id}`, payload);
        toast.success('Booking updated');
      } else {
        await api.post('/api/bookings', payload);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Customer Name *</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} className="input-modern" placeholder="John Doe" required />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Mobile Number *</label>
          <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} className="input-modern" placeholder="+91 9876543210" required />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Date *</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className="input-modern" required />
        </div>
        {module !== 'cricket' && module !== 'shooting' && module !== 'marriage' && module !== 'banquet' && (
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Time Slot *</label>
            <select name="timeSlot" value={form.timeSlot} onChange={handleChange} className="input-modern bg-white" required>
              <option value="">Select slot</option>
              {config.slots?.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        {module === 'shooting' && (
          <>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Start Time *</label>
              <input name="startTime" type="text" value={form.startTime} onChange={handleChange} className="input-modern" placeholder="e.g. 10:00 AM" required />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">End Time *</label>
              <input name="endTime" type="text" value={form.endTime} onChange={handleChange} className="input-modern" placeholder="e.g. 12:00 PM" required />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">People Count</label>
              <input name="peopleCount" type="number" value={form.peopleCount} onChange={handleChange} className="input-modern" placeholder="e.g. 5" />
            </div>
          </>
        )}

        {(module === 'marriage' || module === 'banquet') && (
          <div>
            <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Booking Option *</label>
            <select name="bookingType" value={form.bookingType} onChange={handleChange} className="input-modern bg-white" required>
              <option value="">Select option</option>
              <option value="full-day">Full Day</option>
              <option value="morning">Morning Half Day</option>
              <option value="evening">Evening Half Day</option>
            </select>
          </div>
        )}

        {module === 'marriage' && (
          <>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Guest Count</label>
              <input name="guestCount" type="number" value={form.guestCount} onChange={handleChange} className="input-modern" placeholder="e.g. 500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Decoration Notes</label>
              <textarea name="decorationNotes" value={form.decorationNotes} onChange={handleChange} className="input-modern min-h-[80px]" rows={2} placeholder="Decoration requirements..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Event Notes</label>
              <textarea name="eventNotes" value={form.eventNotes} onChange={handleChange} className="input-modern min-h-[80px]" rows={2} placeholder="Other event details..." />
            </div>
          </>
        )}

        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Total Amount *</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 font-medium">₹</span>
            <input name="totalAmount" type="number" value={form.totalAmount} onChange={handleChange} className="input-modern pl-8" placeholder="0.00" required />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Advance Payment</label>
          <div className="relative">
            <span className="absolute left-4 top-3.5 text-gray-500 font-medium">₹</span>
            <input name="advanceAmount" type="number" value={form.advanceAmount} onChange={handleChange} className="input-modern pl-8" placeholder="0.00" />
          </div>
        </div>
        
        <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-dark-border flex justify-between items-center">
          <span className="text-sm font-medium text-gray-400">Remaining Balance</span>
          <span className="text-xl font-bold text-gray-900">₹{remaining.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">Additional Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="input-modern min-h-[80px]" rows={2} placeholder="Any other instructions..." />
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-6 border-t border-dark-border">
        <button type="button" onClick={onCancel} className="btn-outline flex-1">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 flex justify-center items-center gap-2">
          <Save size={18} />
          {loading ? 'Saving...' : initial ? 'Update Booking' : 'Save Booking'}
        </button>
      </div>
    </form>
  );
}
