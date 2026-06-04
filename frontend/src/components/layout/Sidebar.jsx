import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { 
  LayoutDashboard, Users, IndianRupee, FileBarChart2, 
  Bell, Building2, Camera, Trees, Trophy,
  X, UserCog, LogOut, UserRoundCog, Receipt, Settings
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/payments', label: 'Payments', icon: IndianRupee },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/owners', label: 'Owners', icon: UserCog },
  { to: '/users', label: 'Staff', icon: UserRoundCog },
  { to: '/settings/branding', label: 'Settings', icon: Settings },
];

const modules = [
  { id: 'cricket', to: '/module/cricket', label: 'Cricket Ground', icon: Trophy },
  { id: 'shooting', to: '/module/shooting', label: 'Shooting Studio', icon: Camera },
  { id: 'marriage', to: '/module/marriage', label: 'Marriage Ground', icon: Trees },
  { id: 'banquet', to: '/module/banquet', label: 'Banquet Hall', icon: Building2 },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isSuperAdmin, isOwner, isStaff } = useAuth();
  const { branding } = useBranding();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium border ${
      isActive
        ? 'bg-gray-100 text-black border-gray-200 shadow-sm'
        : 'text-gray-500 hover:text-black hover:bg-gray-50 border-transparent'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="p-6 border-b border-dark-border bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {branding?.logo ? (
              <img src={branding.logo} alt="Company Logo" className="h-11 w-11 object-contain shrink-0" />
            ) : (
              <>
                <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-xs">V</div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-gray-900 tracking-tight truncate">{branding?.companyName || 'Venue CRM'}</h1>
                  <p className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase truncate">{branding?.tagline || 'Enterprise Edition'}</p>
                </div>
              </>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-black transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto flex-1 bg-white">
        {!isStaff && (
          <>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Overview</p>
            {navItems.map((item) => {
              if (item.to === '/users' && !isSuperAdmin) return null;
              if (item.to === '/payments' && !isSuperAdmin) return null;
              if (item.to === '/owners' && !isSuperAdmin && !isOwner) return null;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} onClick={onClose}>
                  <item.icon size={18} className="stroke-[1.75]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}

        <p className="px-3 py-2 mt-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">Venues</p>
        {modules.map((item) => {
          if (isStaff && !user?.assignedModules?.includes(item.id)) return null;
          return (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              <item.icon size={18} className="stroke-[1.75]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-border bg-gray-50 mt-auto shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white font-bold border border-black shadow-sm">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-gray-500 capitalize font-medium">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-200/50 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 z-50 h-screen w-72 bg-white border-r border-dark-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:h-screen flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
