import { MODULES, PAYMENT_COLORS, formatCurrency, formatDate } from '../../utils/constants';

export default function BookingCard({ booking, onView, onEdit, onCancel, onMarkPaid }) {
  const moduleLabel = MODULES[booking.module]?.label || booking.module;

  return (
    <div className="card-luxury animate-slide-up">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-white">{booking.customerName}</h3>
          <a href={`tel:${booking.mobile}`} className="text-sm text-luxury-gold">{booking.mobile}</a>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${PAYMENT_COLORS[booking.paymentStatus]}`}>
          {booking.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
        <div><span className="text-gray-600">Module</span><p className="text-white">{moduleLabel}</p></div>
        <div><span className="text-gray-600">Type</span><p className="text-white">{booking.bookingType || booking.shootCategory || '—'}</p></div>
        <div><span className="text-gray-600">Date</span><p className="text-white">{formatDate(booking.date)}</p></div>
        <div><span className="text-gray-600">Slot</span><p className="text-white">{booking.timeSlot}</p></div>
        <div><span className="text-gray-600">Advance</span><p className="text-emerald-400">{formatCurrency(booking.advanceAmount)}</p></div>
        <div><span className="text-gray-600">Remaining</span><p className="text-yellow-400">{formatCurrency(booking.remainingAmount)}</p></div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onView(booking)} className="btn-outline text-xs flex-1 min-w-[70px] min-h-[40px]">View</button>
        <button onClick={() => onEdit(booking)} className="btn-outline text-xs flex-1 min-w-[70px] min-h-[40px]">Edit</button>
        <button onClick={() => onCancel(booking)} className="text-xs flex-1 min-w-[70px] min-h-[40px] px-3 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10">Cancel</button>
        {booking.paymentStatus !== 'Paid' && (
          <button onClick={() => onMarkPaid(booking)} className="btn-gold text-xs flex-1 min-w-[70px] min-h-[40px]">Mark Paid</button>
        )}
      </div>
    </div>
  );
}
