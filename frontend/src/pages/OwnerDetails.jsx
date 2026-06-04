import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Percent, 
  BookOpen, Clock, ShieldCheck, User, Tent, Camera, 
  CalendarDays, PartyPopper, CheckCircle, HelpCircle, XCircle 
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MODULES_MAP = {
  cricket: { label: 'Cricket Ground', icon: Tent, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  shooting: { label: 'Shooting Studio', icon: Camera, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  marriage: { label: 'Marriage Ground', icon: CalendarDays, color: 'text-gray-900 bg-gray-100 border-gray-200' },
  banquet: { label: 'Banquet Hall', icon: PartyPopper, color: 'text-gray-900 bg-gray-100 border-gray-200' },
};

const PAYMENT_STATUS_COLORS = {
  Paid: 'bg-black text-white border-black',
  Pending: 'bg-gray-100 text-gray-500 border-gray-200',
  Partial: 'bg-gray-200 text-gray-800 border-gray-300',
};

export default function OwnerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/users/${id}`);
        setData(res.data.data);
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

          {user.bio && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-dark-border text-gray-600 text-sm italic w-full text-left">
              "{user.bio}"
            </div>
          )}

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
            {user.address && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{user.address}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gray-400 shrink-0" />
              <span>Partner since: {new Date(user.joinDate || user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Bookings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Ownership Share Card */}
            <div className="card-modern p-5 flex items-center justify-between overflow-hidden relative bg-white">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ownership Share</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{pct}%</h3>
                <p className="text-xs text-gray-500 font-medium">Partnership Equity in Venue CRM</p>
              </div>
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                {/* SVG Progress Circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-gray-100" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    className="stroke-black" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 28} 
                    strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)} 
                  />
                </svg>
                <Percent size={18} className="absolute text-black" />
              </div>
            </div>

            {/* Total Bookings Card */}
            <div className="card-modern p-5 flex items-center justify-between overflow-hidden bg-white">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Bookings Created</p>
                <h3 className="text-3xl font-extrabold text-gray-900">{activity?.totalBookings || 0}</h3>
                <p className="text-xs text-gray-500 font-medium">Total customer reservations secured</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-black shadow-sm">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          {/* Recent Bookings Activity */}
          <div className="card-modern p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Clock className="text-black" size={18} />
                Recent Booking Activity
              </h3>
              <span className="text-xs text-gray-500 font-medium">Last 5 bookings</span>
            </div>

            {activity?.recentBookings?.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-sm">
                No bookings created by this owner yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-500 text-xs uppercase font-bold tracking-wider">
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Venue</th>
                      <th className="pb-3">Date & Slot</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {activity?.recentBookings?.map((booking) => {
                      const mod = MODULES_MAP[booking.module];
                      const ModIcon = mod?.icon || Tent;
                      return (
                        <tr key={booking._id} className="text-gray-700 hover:bg-gray-50 transition-colors group">
                          <td className="py-3.5 pr-3 font-semibold text-gray-950 truncate max-w-[140px]">
                            {booking.customerName}
                          </td>
                          <td className="py-3.5 pr-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border ${mod?.color || 'text-gray-500 border-gray-250 bg-gray-50'}`}>
                              <ModIcon size={12} />
                              {mod?.label || booking.module}
                            </span>
                          </td>
                          <td className="py-3.5 pr-3">
                            <div className="font-semibold text-gray-900">
                              {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">{booking.timeSlot}</div>
                          </td>
                          <td className="py-3.5 pr-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${PAYMENT_STATUS_COLORS[booking.paymentStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-bold text-gray-900">
                            ₹{booking.totalAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
