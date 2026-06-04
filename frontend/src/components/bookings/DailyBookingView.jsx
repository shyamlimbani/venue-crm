import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import BookingCard from './BookingCard';
import BookingForm from './BookingForm';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Plus, CalendarX2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DailyBookingView({ module, date, onRefreshCalendar }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchBookings = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/bookings/date', { params: { date, module } });
      setBookings(data.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [date, module]);

  const handleCancel = async (booking) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.delete(`/api/bookings/${booking._id}`);
      toast.success('Booking cancelled');
      fetchBookings();
      onRefreshCalendar?.();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const handleMarkPaid = async (booking) => {
    try {
      await api.patch(`/api/bookings/${booking._id}/mark-paid`);
      toast.success('Marked as paid');
      fetchBookings();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  if (!date) {
    return (
      <div className="card-modern flex flex-col items-center justify-center text-gray-500 py-16 border-dashed border-2">
        <CalendarX2 size={48} className="text-gray-400 mb-4" />
        <p className="font-medium text-gray-500 text-lg">No date selected</p>
        <p className="text-sm mt-1">Select a date on the calendar to view its bookings.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {format(new Date(date), 'EEEE')}
          </h2>
          <p className="text-gray-500 font-medium">{format(new Date(date), 'd MMMM yyyy')}</p>
        </div>
        <button onClick={() => { setSelected(null); setModal('create'); }} className="btn-primary flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-modern flex flex-col items-center justify-center text-center py-16 border-dashed border-2">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <CalendarX2 size={24} className="text-gray-500" />
          </div>
          <p className="font-medium text-gray-900 text-lg">No bookings yet</p>
          <p className="text-sm text-gray-500 mt-1">The schedule is clear for this date.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                onView={(bk) => { setSelected(bk); setModal('view'); }}
                onEdit={(bk) => { setSelected(bk); setModal('edit'); }}
                onCancel={handleCancel}
                onMarkPaid={handleMarkPaid}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Edit Booking' : 'New Booking'}
        size="lg"
      >
        <BookingForm
          module={module}
          initial={modal === 'edit' ? selected : null}
          defaultDate={date}
          onSuccess={() => { setModal(null); fetchBookings(); onRefreshCalendar?.(); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      <Modal isOpen={modal === 'view'} onClose={() => setModal(null)} title="Booking Details" size="md">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-xl border border-dark-border grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Customer</span>
                <p className="text-gray-900 font-medium text-base">{selected.customerName}</p>
                <a href={`tel:${selected.mobile}`} className="text-black font-semibold underline hover:text-gray-800">{selected.mobile}</a>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Slot</span>
                <p className="text-gray-900">{selected.timeSlot}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Total Amount</span>
                <p className="text-gray-900 font-medium">₹{selected.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            {(selected.guestCount > 0 || selected.notes || selected.decorationNotes || selected.eventNotes) && (
              <div className="p-4 bg-gray-50 rounded-xl border border-dark-border space-y-4">
                {selected.guestCount > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Guest Count</span>
                    <p className="text-gray-700">{selected.guestCount}</p>
                  </div>
                )}
                {selected.notes && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">General Notes</span>
                    <p className="text-gray-700">{selected.notes}</p>
                  </div>
                )}
                {selected.decorationNotes && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Decoration</span>
                    <p className="text-gray-700">{selected.decorationNotes}</p>
                  </div>
                )}
                {selected.eventNotes && (
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Event Details</span>
                    <p className="text-gray-700">{selected.eventNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
