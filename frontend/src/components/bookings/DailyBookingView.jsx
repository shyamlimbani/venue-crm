import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import BookingCard from './BookingCard';
import BookingForm from './BookingForm';
import Modal from '../ui/Modal';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Plus, CalendarX2, FileText, Download, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { downloadInvoicePDF, generateInvoicePDF } from '../../utils/invoiceGenerator';

export default function DailyBookingView({ module, date, onRefreshCalendar }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { isSuperAdmin, isOwner, isStaff } = useAuth();
  const { branding } = useBranding();

  const canViewInvoice = isSuperAdmin || isOwner || isStaff;
  const canDownloadPrint = isSuperAdmin || isOwner;

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
            
            {canViewInvoice && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setModal('invoice');
                  }}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <FileText size={16} /> View Invoice
                </button>
                {canDownloadPrint && (
                  <button
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        await downloadInvoicePDF(selected, branding);
                        toast.success('Invoice downloaded');
                      } catch (err) {
                        toast.error('Failed to generate PDF');
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Download size={16} /> Download
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={modal === 'invoice'} onClose={() => setModal('view')} title="Invoice Preview" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 p-8 rounded-xl min-h-[400px] flex flex-col">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
                <div>
                  {branding.logoDataUrl ? (
                    <img src={branding.logoDataUrl} alt="Logo" className="h-12 object-contain mb-2" />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-900">{branding.companyName}</h2>
                  )}
                  <p className="text-sm text-gray-500">{selected.module === 'cricket-ground' ? 'Cricket Ground' : selected.module === 'shooting-studio' ? 'Shooting Studio' : selected.module === 'marriage-ground' ? 'Marriage Ground' : selected.module === 'banquet-hall' ? 'Banquet Hall' : selected.module}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">INVOICE</h1>
                  <p className="text-sm font-medium text-gray-500 mt-1">INV-{format(new Date(selected.createdAt || selected.date), 'yyyyMMdd')}-{selected._id.substring(selected._id.length - 4).toUpperCase()}</p>
                </div>
              </div>

              {/* Customer & Booking Details */}
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-400 uppercase tracking-wider text-xs mb-2">Billed To</h3>
                  <p className="font-medium text-gray-900">{selected.customerName}</p>
                  <p className="text-gray-600">{selected.mobile}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-gray-400 uppercase tracking-wider text-xs mb-2">Booking Details</h3>
                  <p className="text-gray-600"><span className="font-medium text-gray-900">Event Date:</span> {format(new Date(selected.date), 'dd MMM yyyy')}</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-900">Time Slot:</span> {selected.timeSlot}</p>
                </div>
              </div>

              {/* Amount Details */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Venue Booking - {selected.timeSlot}</td>
                      <td className="px-4 py-3 text-right">₹{selected.totalAmount?.toLocaleString('en-IN') || 0}</td>
                    </tr>
                    {(selected.advanceAmount || 0) > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-gray-500">Advance Paid</td>
                        <td className="px-4 py-3 text-right text-gray-500">- ₹{selected.advanceAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900 text-right">Total Due</td>
                      <td className="px-4 py-3 font-bold text-gray-900 text-right text-lg">₹{((selected.totalAmount || 0) - (selected.advanceAmount || 0)).toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Footer Note */}
              <div className="mt-auto pt-6 text-center text-xs text-gray-400">
                <p>Thank you for choosing {branding.companyName}</p>
              </div>
            </div>

            {canDownloadPrint && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      const doc = generateInvoicePDF(selected, branding);
                      doc.autoPrint();
                      window.open(doc.output('bloburl'), '_blank');
                    } catch (err) {
                      toast.error('Failed to print');
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="btn-secondary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Printer size={16} /> Print
                </button>
                <button
                  onClick={async () => {
                    setIsGenerating(true);
                    try {
                      await downloadInvoice(selected, branding);
                      toast.success('Invoice downloaded');
                    } catch (err) {
                      toast.error('Failed to download');
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
