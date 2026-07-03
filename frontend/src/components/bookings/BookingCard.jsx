import { MODULES, PAYMENT_COLORS, formatCurrency, formatDate } from '../../utils/constants';
import { motion } from 'framer-motion';
import { Phone, Calendar, Clock, Banknote, Edit2, Eye, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BookingCard({ booking, onView, onEdit, onCancel, onMarkPaid }) {
  const { user } = useAuth();
  const moduleLabel = MODULES[booking.module]?.label || booking.module;
  
  const canEdit = user?.role === 'admin' || (booking.bookingOwnerId === user?._id);

  const getBookingTypeLabel = (type) => {
    if (type === 'full-day') return 'Full Day';
    if (type === 'morning') return 'Morning Half Day';
    if (type === 'evening') return 'Evening Half Day';
    return type || 'Standard Booking';
  };

  const getDuration = () => {
    if (!booking.fromDate || !booking.toDate) return 1;
    const diff = new Date(booking.toDate) - new Date(booking.fromDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-modern hover:border-black/50 transition-colors group"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight break-words">{booking.customerName}</h3>
            {booking.bookingOwnerName && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 w-fit shrink-0">
                <ShieldCheck size={10} />
                {booking.bookingOwnerName}
              </span>
            )}
          </div>
          <a href={`tel:${booking.mobile}`} className="flex items-center gap-1.5 text-sm text-gray-600 mt-1 hover:underline">
            <Phone size={14} />
            {booking.mobile}
          </a>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border w-fit ${PAYMENT_COLORS[booking.paymentStatus]}`}>
          {booking.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-5 p-3 rounded-xl bg-gray-50 border border-dark-border">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Calendar size={12} /> Period & Schedule
          </span>
          <p className="text-gray-900 font-medium">
            {formatDate(booking.fromDate)} 
            {booking.fromDate !== booking.toDate && ` → ${formatDate(booking.toDate)}`}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {getDuration()} {getDuration() === 1 ? 'Day' : 'Days'} • {booking.module === 'cricket' && 'Full Day Booking'}
            {booking.module === 'shooting' && `${booking.startTime} - ${booking.endTime}`}
            {(booking.module === 'marriage' || booking.module === 'banquet') && getBookingTypeLabel(booking.bookingType)}
            {!['cricket', 'shooting', 'marriage', 'banquet'].includes(booking.module) && booking.timeSlot}
          </p>
        </div>
        
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            <Clock size={12} /> Venue Details
          </span>
          <p className="text-gray-900 font-medium">{moduleLabel}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {booking.module === 'shooting' && `${booking.peopleCount || 0} People`}
            {booking.module === 'marriage' && `${booking.guestCount || 0} Guests`}
            {booking.module === 'cricket' && `🔒 Fully Booked`}
            {booking.module === 'banquet' && `Banquet Event`}
            {!['cricket', 'shooting', 'marriage', 'banquet'].includes(booking.module) && 'Active'}
          </p>
        </div>

        <div className="col-span-1 sm:col-span-2 border-t border-dark-border pt-3 mt-1">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs text-gray-500 block mb-0.5">Advance Paid</span>
              <p className="text-gray-900 font-medium">{formatCurrency(booking.advanceAmount)}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block mb-0.5">Remaining Balance</span>
              <p className="text-gray-900 font-bold">{formatCurrency(booking.remainingAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onView(booking)} className="btn-outline text-xs flex-1 min-w-[80px] sm:min-w-[70px] min-h-[36px] flex justify-center items-center gap-1.5">
          <Eye size={14} /> View
        </button>
        {canEdit ? (
          <>
            <button onClick={() => onEdit(booking)} className="btn-outline text-xs flex-1 min-w-[80px] sm:min-w-[70px] min-h-[36px] flex justify-center items-center gap-1.5">
              <Edit2 size={14} /> Edit
            </button>
            <button onClick={() => onCancel(booking)} className="text-xs flex-1 min-w-[80px] sm:min-w-[70px] min-h-[36px] flex justify-center items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-black transition-colors">
              <Trash2 size={14} /> Cancel
            </button>
            {booking.paymentStatus !== 'Paid' && (
              <button onClick={() => onMarkPaid(booking)} className="btn-primary text-xs w-full sm:w-auto sm:flex-[2] min-h-[36px] flex justify-center items-center gap-1.5">
                <CheckCircle2 size={14} /> Mark Paid
              </button>
            )}
          </>
        ) : (
          <div className="w-full text-center text-xs text-gray-500 flex items-center justify-center p-2 bg-gray-50 rounded-lg border border-gray-200">
            Only {booking.bookingOwnerName || 'owner'} can modify this
          </div>
        )}
      </div>
    </motion.div>
  );
}
