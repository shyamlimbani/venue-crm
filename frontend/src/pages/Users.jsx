import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, UserCog, UserPlus, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ROLES = {
  admin: { label: 'Super Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: ShieldAlert },
  owner: { label: 'Owner', color: 'bg-primary/10 text-primary-light border-primary/20', icon: ShieldCheck },
  staff: { label: 'Staff', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Shield },
};

const MODULES = [
  { id: 'cricket', label: 'Cricket Ground' },
  { id: 'shooting', label: 'Shooting Studio' },
  { id: 'marriage', label: 'Marriage Ground' },
  { id: 'banquet', label: 'Banquet Hall' }
];

export default function Users() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState('all');

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'staff',
    isActive: true,
    assignedModules: [],
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users');
      setUsers(data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        password: '',
        role: user.role,
        isActive: user.isActive,
        assignedModules: user.assignedModules || [],
      });
    } else {
      setEditingUser(null);
      setForm({
        name: '', email: '', mobile: '', password: '', role: 'staff', isActive: true, assignedModules: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${editingUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/api/users', form);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleModuleToggle = (moduleId) => {
    setForm(prev => {
      const isSelected = prev.assignedModules.includes(moduleId);
      return {
        ...prev,
        assignedModules: isSelected 
          ? prev.assignedModules.filter(m => m !== moduleId)
          : [...prev.assignedModules, moduleId]
      };
    });
  };

  const filteredUsers = users.filter(u => filter === 'all' || u.role === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCog className="text-primary-light" />
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage owners, staff, and system access</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Add New User
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 rounded-lg w-fit">
        {['all', 'admin', 'owner', 'staff'].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${filter === r ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'}`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, idx) => {
            const RoleIcon = ROLES[user.role]?.icon || Shield;
            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-modern relative overflow-hidden group"
              >
                {!user.isActive && (
                  <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg border-b border-l border-red-500/20">
                    INACTIVE
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-dark-border flex items-center justify-center text-xl font-bold text-white overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg truncate ${!user.isActive ? 'text-gray-500' : 'text-white'}`}>{user.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${ROLES[user.role]?.color}`}>
                        <RoleIcon size={10} />
                        {ROLES[user.role]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail size={14} className="text-gray-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.mobile && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone size={14} className="text-gray-500" />
                      <span>{user.mobile}</span>
                    </div>
                  )}
                </div>

                {user.role === 'staff' && user.assignedModules?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dark-border">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Assigned Venues</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.assignedModules.map(mod => {
                        const mInfo = MODULES.find(m => m.id === mod);
                        return (
                          <span key={mod} className="text-[10px] font-medium bg-slate-800 text-gray-300 px-2 py-1 rounded-md border border-dark-border">
                            {mInfo?.label || mod}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-dark-border flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(user)} className="btn-outline flex-1 py-1.5 min-h-0 text-xs flex justify-center items-center gap-1.5">
                    <Pencil size={14} /> Edit
                  </button>
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user._id)} className="btn-outline flex-1 py-1.5 min-h-0 text-xs flex justify-center items-center gap-1.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Edit User' : 'Create New User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-modern" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-modern" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Mobile</label>
              <input type="tel" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} className="input-modern" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Role *</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="input-modern bg-slate-900" required>
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              </label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-modern" required={!editingUser} minLength={6} />
            </div>
          </div>

          {form.role === 'staff' && (
            <div className="col-span-2 pt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Assigned Venues</label>
              <div className="grid grid-cols-2 gap-2">
                {MODULES.map(mod => (
                  <label key={mod.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${form.assignedModules.includes(mod.id) ? 'bg-primary/10 border-primary/50' : 'bg-slate-900 border-dark-border hover:bg-slate-800'}`}>
                    <input 
                      type="checkbox" 
                      checked={form.assignedModules.includes(mod.id)} 
                      onChange={() => handleModuleToggle(mod.id)}
                      className="rounded border-gray-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" 
                    />
                    <span className={`text-sm font-medium ${form.assignedModules.includes(mod.id) ? 'text-white' : 'text-gray-400'}`}>{mod.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {editingUser && (
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.isActive} 
                  onChange={e => setForm({...form, isActive: e.target.checked})}
                  className="rounded border-gray-600 bg-slate-800 text-primary focus:ring-primary focus:ring-offset-slate-900" 
                />
                Account Active
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-dark-border mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{editingUser ? 'Update User' : 'Create User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
