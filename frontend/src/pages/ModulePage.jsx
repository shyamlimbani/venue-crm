import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MODULES } from '../utils/constants';
import SmartCalendar from '../components/calendar/SmartCalendar';
import DailyBookingView from '../components/bookings/DailyBookingView';

export default function ModulePage() {
  const { moduleId } = useParams();
  const mod = MODULES[moduleId];
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!mod) {
    return <p className="text-center text-gray-500">Module not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className={`card-luxury bg-gradient-to-r ${mod.color} border-luxury-gold/20`}>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{mod.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-white">{mod.label}</h2>
            <p className="text-sm text-gray-400">
              {moduleId === 'cricket' && 'Time-slot booking · Duplicate prevention'}
              {moduleId === 'shooting' && 'Hourly booking · Shoot categories'}
              {moduleId === 'marriage' && 'Full-day wedding management'}
              {moduleId === 'banquet' && 'Half-day / Full-day events'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SmartCalendar
          module={moduleId}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <DailyBookingView
          key={refreshKey}
          module={moduleId}
          date={selectedDate}
          onRefreshCalendar={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    </div>
  );
}
