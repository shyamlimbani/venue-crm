import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, CreditCard, BarChart, 
  Bell, Tent, Camera, PartyPopper, CalendarDays,
  X, UserCog, LogOut, ShieldCheck
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/reports', label: 'Reports', icon: BarChart },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/owners', label: 'Owners', icon: ShieldCheck },
  { to: '/users', label: 'User Mgmt', icon: UserCog },
];

const modules = [
  { id: 'cricket', to: '/module/cricket', label: 'Cricket Ground', icon: Tent },
  { id: 'shooting', to: '/module/shooting', label: 'Shooting Studio', icon: Camera },
  { id: 'marriage', to: '/module/marriage', label: 'Marriage Ground', icon: CalendarDays },
  { id: 'banquet', to: '/module/banquet', label: 'Banquet Hall', icon: PartyPopper },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isSuperAdmin, isOwner, isStaff } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      isActive
        ? 'bg-primary/10 text-primary-light'
        : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
    }`;

  const sidebarContent = (
    <>
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Venue CRM</h1>
            <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide uppercase">Enterprise Edition</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-160px)]">
        {!isStaff && (
          <>
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Overview</p>
            {navItems.map((item) => {
              if (item.to === '/users' && !isSuperAdmin) return null;
              if (item.to === '/payments' && !isSuperAdmin) return null;
              if (item.to === '/owners' && !isSuperAdmin && !isOwner) return null;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}

        <p className="px-3 py-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-500">Venues</p>
        {modules.map((item) => {
          if (isStaff && !user?.assignedModules?.includes(item.id)) return null;
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-border bg-slate-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary-light font-semibold border border-primary/30">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-900 border-r border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
