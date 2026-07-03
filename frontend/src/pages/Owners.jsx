import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Plus, Pencil, Trash2, Mail, Phone, MapPin, 
  Calendar, Percent, FileText, Eye, User, Upload, Search
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Owners() {
  const { isSuperAdmin } = useAuth();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    phone: '',
    password: '',
    ownershipPercentage: 0,
    totalInvestment: '',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    profileImage: '',
    isActive: true
  });

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users');
      // Filter only users with role 'owner'
      const ownersOnly = data.data.filter(u => u.role === 'owner');
      setOwners(ownersOnly);
    } catch (err) {
      toast.error('Failed to load owners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const openModal = (owner = null) => {
    if (owner) {
      setEditingOwner(owner);
      setForm({
        name: owner.name || '',
        email: owner.email || '',
        mobile: owner.mobile || '',
        phone: owner.phone || owner.mobile || '',
        password: '',
        ownershipPercentage: owner.ownershipPercentage || 0,
        totalInvestment: owner.totalInvestment || '',
        paymentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        profileImage: owner.profileImage || '',
        isActive: owner.isActive !== undefined ? owner.isActive : true
      });
    } else {
      setEditingOwner(null);
      setForm({
        name: '',
        email: '',
        mobile: '',
        phone: '',
        password: '',
        ownershipPercentage: 0,
        totalInvestment: '',
        paymentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        profileImage: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, role: 'owner' };
      // Ensure phone and mobile are synced
      if (!payload.mobile && payload.phone) payload.mobile = payload.phone;
      if (!payload.phone && payload.mobile) payload.phone = payload.mobile;
      
      if (editingOwner) {
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${editingOwner._id}`, payload);
        toast.success('Owner profile updated successfully');
      } else {
        await api.post('/api/users', payload);
        toast.success('Owner profile created successfully');
      }
      setIsModalOpen(false);
      fetchOwners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save owner profile');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this owner profile?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('Owner profile removed');
      fetchOwners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete owner profile');
    }
  };

  const getPartnerBadge = (percentage) => {
    const pct = Number(percentage) || 0;
    if (pct >= 40) return { text: `${pct}% Founder`, color: 'bg-black text-white border-black font-semibold shadow-sm' };
    if (pct > 0) return { text: `${pct}% Co-Owner`, color: 'bg-gray-200 text-gray-800 border-gray-300 font-semibold' };
    return { text: 'Partner', color: 'bg-gray-100 text-gray-600 border-gray-255' };
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-black" />
            Owners & Partners
          </h1>
          <p className="text-gray-500 text-sm mt-1">View business ownership structure, shares, and profiles</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Owner
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 bg-white border border-dark-border px-4 py-2.5 rounded-lg max-w-md focus-within:border-black focus-within:ring-1 focus-within:ring-black/25 transition-all shadow-sm">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search owners by name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent text-gray-900 placeholder-gray-400 text-sm outline-none w-full"
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOwners.map((owner, idx) => {
            const badge = getPartnerBadge(owner.ownershipPercentage);
            return (
              <motion.div
                key={owner._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-modern bg-white relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${badge.color}`}>
                      {badge.text}
                    </span>
                    {!owner.isActive && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200 uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-dark-border flex items-center justify-center text-2xl font-bold text-gray-900 overflow-hidden shadow-sm shrink-0">
                      {owner.profileImage ? (
                        <img src={owner.profileImage} alt={owner.name} className="w-full h-full object-cover" />
                      ) : (
                        owner.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-xl truncate ${!owner.isActive ? 'text-gray-400' : 'text-gray-900'}`}>
                        {owner.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Owner / Partner</p>
                    </div>
                  </div>

                  {owner.bio && (
                    <p className="text-gray-500 text-sm mt-4 line-clamp-2 italic">
                      "{owner.bio}"
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-dark-border space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                    {(owner.phone || owner.mobile) && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{owner.phone || owner.mobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dark-border flex items-center gap-2">
                  <Link 
                    to={`/owners/${owner._id}`} 
                    className="btn-outline flex-1 py-2 text-xs flex justify-center items-center gap-1.5 font-bold text-black hover:bg-gray-100"
                  >
                    <Eye size={14} /> Quick View
                  </Link>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(owner)} 
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-dark-border text-gray-500 hover:text-black transition-colors"
                        title="Edit Owner"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(owner._id)} 
                        className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-dark-border text-gray-500 hover:text-black transition-colors"
                        title="Delete Owner"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {isSuperAdmin && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title={editingOwner ? 'Edit Owner Profile' : 'Add New Owner'}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Uploader */}
            <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-dark-border">
              <div className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center text-3xl font-bold text-gray-900 overflow-hidden shadow-sm">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-[10px] text-white">
                  <Upload size={16} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-gray-500">Max size: 2MB. JPG, PNG or WebP</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Full Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="input-modern" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Email *</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="input-modern" 
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Mobile Number</label>
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value, mobile: e.target.value})} 
                  className="input-modern" 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
                  {editingOwner ? 'New Password (optional)' : 'Password *'}
                </label>
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  className="input-modern" 
                  required={!editingOwner} 
                  minLength={6} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Ownership Share (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={form.ownershipPercentage} 
                    onChange={e => setForm({...form, ownershipPercentage: Math.min(100, Math.max(0, Number(e.target.value)))})} 
                    className="input-modern pr-8" 
                    min={0}
                    max={100}
                    required
                  />
                  <Percent size={14} className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div className="sm:col-span-2 border-t border-dark-border pt-4 mt-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Total Investment Amount (₹) *</label>
                <input 
                  type="number" 
                  value={form.totalInvestment} 
                  onChange={e => setForm({...form, totalInvestment: e.target.value})} 
                  className="input-modern font-bold" 
                  required
                />
              </div>

              {!editingOwner && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Initial Payment Date</label>
                    <input 
                      type="date" 
                      value={form.paymentDate} 
                      onChange={e => setForm({...form, paymentDate: e.target.value})} 
                      className="input-modern" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Initial Payment Amount (₹)</label>
                    <input 
                      type="number" 
                      value={form.paymentAmount} 
                      onChange={e => setForm({...form, paymentAmount: e.target.value})} 
                      className="input-modern" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Payment Method</label>
                    <select 
                      value={form.paymentMethod} 
                      onChange={e => setForm({...form, paymentMethod: e.target.value})} 
                      className="input-modern"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </>
              )}

              <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isActive} 
                    onChange={e => setForm({...form, isActive: e.target.checked})}
                    className="rounded border-gray-300 bg-white text-black focus:ring-black focus:ring-offset-white" 
                  />
                  Active Owner Account
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-border mt-6">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">{editingOwner ? 'Update Profile' : 'Create Owner'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
