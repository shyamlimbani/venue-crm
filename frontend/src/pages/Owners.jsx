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
    address: '',
    ownershipPercentage: 0,
    bio: '',
    joinDate: new Date().toISOString().split('T')[0],
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
        address: owner.address || '',
        ownershipPercentage: owner.ownershipPercentage || 0,
        bio: owner.bio || '',
        joinDate: owner.joinDate ? new Date(owner.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        address: '',
        ownershipPercentage: 0,
        bio: '',
        joinDate: new Date().toISOString().split('T')[0],
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
    if (pct >= 40) return { text: `${pct}% Founder`, color: 'bg-primary/20 text-primary-light border-primary/30' };
    if (pct > 0) return { text: `${pct}% Co-Owner`, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    return { text: 'Partner', color: 'bg-slate-800 text-gray-400 border-slate-700' };
  };

  const filteredOwners = owners.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-primary-light" />
            Owners & Partners
          </h1>
          <p className="text-gray-400 text-sm mt-1">View business ownership structure, shares, and profiles</p>
        </div>
        {isSuperAdmin && (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Owner
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 bg-slate-900 border border-dark-border px-4 py-2.5 rounded-lg max-w-md">
        <Search size={18} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="Search owners by name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-transparent text-white placeholder-gray-500 text-sm outline-none w-full"
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
                className="card-modern relative overflow-hidden group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${badge.color}`}>
                      {badge.text}
                    </span>
                    {!owner.isActive && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-dark-border flex items-center justify-center text-2xl font-bold text-white overflow-hidden shadow-inner shrink-0">
                      {owner.profileImage ? (
                        <img src={owner.profileImage} alt={owner.name} className="w-full h-full object-cover" />
                      ) : (
                        owner.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-xl truncate ${!owner.isActive ? 'text-gray-500' : 'text-white'}`}>
                        {owner.name}
                      </h3>
                      <p className="text-xs text-primary-light font-medium uppercase tracking-wider mt-0.5">Owner / Partner</p>
                    </div>
                  </div>

                  {owner.bio && (
                    <p className="text-gray-400 text-sm mt-4 line-clamp-2 italic">
                      "{owner.bio}"
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-dark-border/60 space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-500" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                    {(owner.phone || owner.mobile) && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-500" />
                        <span>{owner.phone || owner.mobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dark-border/60 flex items-center gap-2">
                  <Link 
                    to={`/owners/${owner._id}`} 
                    className="btn-outline flex-1 py-2 text-xs flex justify-center items-center gap-1.5 font-semibold text-primary-light hover:text-white"
                  >
                    <Eye size={14} /> Quick View
                  </Link>
                  {isSuperAdmin && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(owner)} 
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-dark-border text-gray-400 hover:text-white transition-colors"
                        title="Edit Owner"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(owner._id)} 
                        className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-dark-border text-gray-400 hover:text-red-400 transition-colors"
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Uploader */}
            <div className="flex flex-col items-center gap-3 p-4 bg-slate-900 rounded-lg border border-dark-border">
              <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-primary/30 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-md">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User size={36} className="text-gray-500" />
                )}
                <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-[10px] text-white">
                  <Upload size={16} />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-gray-500">Max size: 2MB. JPG, PNG or WebP</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Full Name *</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="input-modern" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Email *</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="input-modern" 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Mobile / Phone</label>
                <input 
                  type="tel" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value, mobile: e.target.value})} 
                  className="input-modern" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
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
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Ownership Share (%)</label>
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
                  <Percent size={14} className="absolute right-3 top-3.5 text-gray-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Join Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={form.joinDate} 
                    onChange={e => setForm({...form, joinDate: e.target.value})} 
                    className="input-modern" 
                    required 
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Address</label>
                <input 
                  type="text" 
                  value={form.address} 
                  onChange={e => setForm({...form, address: e.target.value})} 
                  className="input-modern" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Bio / Notes</label>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm({...form, bio: e.target.value})} 
                  className="input-modern h-20 py-2 resize-none" 
                  placeholder="Tell something about this owner..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="rounded border-gray-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" 
                />
                Active Owner Account
              </label>
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
