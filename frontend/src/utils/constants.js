export const MODULES = {
  cricket: { id: 'cricket', label: 'Cricket Ground', icon: '🏏', color: 'from-blue-600/20 to-blue-900/20' },
  shooting: { id: 'shooting', label: 'Shooting Studio', icon: '📸', color: 'from-indigo-600/20 to-indigo-900/20' },
  marriage: { id: 'marriage', label: 'Marriage Ground', icon: '💒', color: 'from-sky-600/20 to-sky-900/20' },
  banquet: { id: 'banquet', label: 'Banquet Hall', icon: '🎉', color: 'from-cyan-600/20 to-cyan-900/20' },
};

export const MODULE_LIST = Object.values(MODULES);

export const PAYMENT_COLORS = {
  Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Partial: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
