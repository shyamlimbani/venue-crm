export const MODULES = {
  cricket: { id: 'cricket', label: 'Cricket Ground', icon: '🏢', color: 'bg-gray-50 border-gray-200' },
  shooting: { id: 'shooting', label: 'Shooting Studio', icon: '📷', color: 'bg-gray-50 border-gray-200' },
  marriage: { id: 'marriage', label: 'Marriage Ground', icon: '🌲', color: 'bg-gray-50 border-gray-200' },
  banquet: { id: 'banquet', label: 'Banquet Hall', icon: '🏢', color: 'bg-gray-50 border-gray-200' },
};

export const MODULE_LIST = Object.values(MODULES);

export const PAYMENT_COLORS = {
  Pending: 'bg-gray-100 text-gray-500 border-gray-200',
  Partial: 'bg-gray-200 text-gray-800 border-gray-300',
  Paid: 'bg-black text-white border-black',
};

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
