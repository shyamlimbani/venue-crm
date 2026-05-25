export const MODULES = {
  cricket: { id: 'cricket', label: 'Cricket Ground', icon: '🏏', color: 'from-green-600/30 to-emerald-900/30' },
  shooting: { id: 'shooting', label: 'Shooting Studio', icon: '📸', color: 'from-purple-600/30 to-indigo-900/30' },
  marriage: { id: 'marriage', label: 'Marriage Ground', icon: '💒', color: 'from-pink-600/30 to-rose-900/30' },
  banquet: { id: 'banquet', label: 'Banquet Hall', icon: '🎉', color: 'from-amber-600/30 to-orange-900/30' },
};

export const MODULE_LIST = Object.values(MODULES);

export const PAYMENT_COLORS = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
