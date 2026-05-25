import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay } from 'date-fns';
import api from '../../api/axios';
import LoadingSpinner from '../ui/LoadingSpinner';

const statusClass = {
  available: 'cal-available',
  partial: 'cal-partial',
  full: 'cal-full',
};

export default function SmartCalendar({ module, onDateSelect, selectedDate }) {
  const [current, setCurrent] = useState(new Date());
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/calendar/${module}`, { params: { year, month } });
        setDays(data.data.days || []);
      } catch {
        setDays([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [module, year, month]);

  const firstDay = getDay(startOfMonth(current));
  const blanks = Array(firstDay).fill(null);
  const dayMap = Object.fromEntries(days.map((d) => [d.day, d]));

  return (
    <div className="card-luxury">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrent(subMonths(current, 1))} className="btn-outline px-3 py-2 min-h-0">‹</button>
        <h3 className="text-luxury-gold font-semibold">{format(current, 'MMMM yyyy')}</h3>
        <button onClick={() => setCurrent(addMonths(current, 1))} className="btn-outline px-3 py-2 min-h-0">›</button>
      </div>

      <div className="flex gap-3 mb-4 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-available border" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-partial border" /> Partial</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded cal-full border" /> Full</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`b-${i}`} />
          ))}
          {Array.from({ length: getDaysInMonth(current) }, (_, i) => {
            const day = i + 1;
            const info = dayMap[day];
            const dateStr = info?.date || `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const st = info?.status || 'available';

            return (
              <button
                key={day}
                onClick={() => onDateSelect(dateStr)}
                className={`aspect-square rounded-lg border text-sm font-medium transition-all
                  flex flex-col items-center justify-center gap-0.5 min-h-[44px]
                  ${statusClass[st]} ${isSelected ? 'ring-2 ring-luxury-gold scale-105' : 'hover:scale-105'}`}
              >
                <span>{day}</span>
                {info?.count > 0 && (
                  <span className="text-[10px] opacity-80">({info.count})</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
