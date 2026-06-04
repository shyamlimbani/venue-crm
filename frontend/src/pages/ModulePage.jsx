import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MODULES } from '../utils/constants';
import SmartCalendar from '../components/calendar/SmartCalendar';
import DailyBookingView from '../components/bookings/DailyBookingView';
import { motion } from 'framer-motion';
import { Building2, Camera, Trees } from 'lucide-react';

const ICONS_MAP = {
  cricket: Building2,
  shooting: Camera,
  marriage: Trees,
  banquet: Building2
};

export default function ModulePage() {
  const { moduleId } = useParams();
  const mod = MODULES[moduleId];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!mod) {
    return <p className="text-center text-gray-500">Module not found</p>;
  }

  const IconComponent = ICONS_MAP[moduleId] || Building2;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern bg-white border-dark-border"
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 text-black">
            <IconComponent size={32} className="stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{mod.label}</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {moduleId === 'cricket' && 'Time-slot booking · Duplicate prevention'}
              {moduleId === 'shooting' && 'Hourly booking · Shoot categories'}
              {moduleId === 'marriage' && 'Full-day wedding management'}
              {moduleId === 'banquet' && 'Half-day / Full-day events'}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <SmartCalendar
            module={moduleId}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <DailyBookingView
            key={refreshKey}
            module={moduleId}
            date={selectedDate}
            onRefreshCalendar={() => setRefreshKey((k) => k + 1)}
          />
        </motion.div>
      </div>
    </div>
  );
}
