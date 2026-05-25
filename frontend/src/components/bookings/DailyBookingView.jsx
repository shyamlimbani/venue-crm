import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import BookingCard from './BookingCard';
import BookingForm from './BookingForm';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function DailyBookingView({ module, date, onRefreshCalendar }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchBookings = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/date', { params: { date, module } });
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
      await api.delete(`/bookings/${booking._id}`);
      toast.success('Booking cancelled');
      fetchBookings();
      onRefreshCalendar?.();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const handleMarkPaid = async (booking) => {
    try {
      await api.patch(`/bookings/${booking._id}/mark-paid`);
      toast.success('Marked as paid');
      fetchBookings();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  if (!date) {
    return (
      <div className="card-luxury text-center text-gray-500 py-12">
        Select a date on the calendar to view bookings
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-luxury-gold">
          {format(new Date(date), 'EEEE, d MMMM yyyy')}
        </h2>
        <button onClick={() => { setSelected(null); setModal('create'); }} className="btn-gold text-sm">
          + New Booking
        </button>
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : bookings.length === 0 ? (
        <div className="card-luxury text-center text-gray-500 py-8">No bookings for this date</div>
      ) : (
        <div className="space-y-4">
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
          <div className="space-y-3 text-sm">
            <p><span className="text-gray-500">Customer:</span> {selected.customerName}</p>
            <p><span className="text-gray-500">Mobile:</span> {selected.mobile}</p>
            <p><span className="text-gray-500">Slot:</span> {selected.timeSlot}</p>
            <p><span className="text-gray-500">Total:</span> ₹{selected.totalAmount}</p>
            <p><span className="text-gray-500">Notes:</span> {selected.notes || '—'}</p>
            {selected.guestCount > 0 && <p><span className="text-gray-500">Guests:</span> {selected.guestCount}</p>}
            {selected.decorationNotes && <p><span className="text-gray-500">Decoration:</span> {selected.decorationNotes}</p>}
            {selected.eventNotes && <p><span className="text-gray-500">Event:</span> {selected.eventNotes}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
