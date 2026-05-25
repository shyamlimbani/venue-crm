import { useLocation } from 'react-router-dom';

const titles = {
  '/': 'Dashboard',
  '/customers': 'Customer CRM',
  '/payments': 'Payment Management',
  '/reports': 'Reports & Analytics',
  '/notifications': 'Notifications',
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const moduleMatch = location.pathname.match(/\/module\/(\w+)/);
  const title = moduleMatch
    ? { cricket: 'Cricket Ground', shooting: 'Shooting Studio', marriage: 'Marriage Ground', banquet: 'Banquet Hall' }[moduleMatch[1]]
    : titles[location.pathname] || 'Venue CRM';

  return (
    <header className="sticky top-0 z-30 bg-luxury-black/90 backdrop-blur-md border-b border-luxury-border">
      <div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg border border-luxury-border text-luxury-gold"
          aria-label="Menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-white flex-1 lg:ml-0 ml-2">{title}</h1>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>
    </header>
  );
}
