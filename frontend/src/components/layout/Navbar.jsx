import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

const titles = {
  '/': 'Dashboard',
  '/customers': 'Customer Management',
  '/payments': 'Payments & Revenue',
  '/reports': 'Analytics',
  '/notifications': 'Notifications',
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const moduleMatch = location.pathname.match(/\/module\/(\w+)/);
  const title = moduleMatch
    ? { cricket: 'Cricket Ground', shooting: 'Shooting Studio', marriage: 'Marriage Ground', banquet: 'Banquet Hall' }[moduleMatch[1]]
    : titles[location.pathname] || 'Venue CRM';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-dark-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 h-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-50 border border-dark-border text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-64 text-gray-900 placeholder-gray-400 transition-all hover:bg-gray-100"
            />
          </div>
          
          <button className="relative p-2 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full animate-pulse border-2 border-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
