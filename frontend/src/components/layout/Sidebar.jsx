import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/customers', label: 'Customers', icon: '◎' },
  { to: '/payments', label: 'Payments', icon: '₹' },
  { to: '/reports', label: 'Reports', icon: '▣' },
  { to: '/notifications', label: 'Alerts', icon: '◉' },
];

const modules = [
  { to: '/module/cricket', label: 'Cricket Ground', icon: '🏏' },
  { to: '/module/shooting', label: 'Shooting Studio', icon: '📸' },
  { to: '/module/marriage', label: 'Marriage Ground', icon: '💒' },
  { to: '/module/banquet', label: 'Banquet Hall', icon: '🎉' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
      isActive
        ? 'bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30'
        : 'text-gray-400 hover:text-white hover:bg-luxury-border/50'
    }`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-luxury-dark border-r border-luxury-border
          transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-5 border-b border-luxury-border">
          <h1 className="font-display text-xl text-luxury-gold tracking-wide">Venue CRM</h1>
          <p className="text-xs text-gray-500 mt-1">Management System</p>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          <p className="px-4 py-2 text-xs uppercase tracking-wider text-gray-600">Main</p>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-gray-600">Modules</p>
          {modules.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-luxury-border bg-luxury-dark">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-outline w-full text-sm">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
