import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay } from 'date-fns';
import api from '../../api/axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        const { data } = await api.get(`/api/calendar/${module}`, { params: { year, month } });
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
    <div className="card-modern">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 font-semibold text-lg">{format(current, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors border border-dark-border">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors border border-dark-border">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6 text-xs font-medium">
        <span className="flex items-center gap-2 text-gray-500"><span className="w-3 h-3 rounded-full bg-white border border-gray-300" /> Available</span>
        <span className="flex items-center gap-2 text-gray-500"><span className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" /> Partial</span>
        <span className="flex items-center gap-2 text-gray-500"><span className="w-3 h-3 rounded-full bg-black border border-black" /> Full</span>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {blanks.map((_, i) => (
            <div key={`b-${i}`} className="aspect-square" />
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
                className={`aspect-square rounded-xl border text-sm font-medium transition-all
                  flex flex-col items-center justify-start py-2 gap-0.5 min-h-[64px]
                  ${statusClass[st]} ${isSelected ? 'ring-2 ring-black bg-black/5 border-black shadow-sm scale-105 z-10' : 'hover:scale-105 hover:bg-gray-150'}`}
              >
                <div className="flex items-center gap-1">
                  <span className={isSelected ? 'text-black font-bold' : 'text-gray-800'}>{day}</span>
                  {info?.count > 0 && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {info.count}
                    </span>
                  )}
                </div>
                {info?.bookings?.length > 0 && (
                  <div className="flex flex-col gap-0.5 mt-1 w-full px-1 overflow-hidden">
                    {info.bookings.slice(0, 2).map((b) => {
                      const firstOwnerName = b.bookingOwnerName?.split(' ')[0] || 'Owner';
                      if (module === 'cricket') {
                        return (
                          <span key={b._id} className="text-[8px] bg-black text-white border border-black truncate px-1 py-0.5 rounded-md font-semibold text-center w-full block shadow-sm" title={`Booked by ${b.bookingOwnerName}`}>
                            🔒 {firstOwnerName}
                          </span>
                        );
                      }
                      if (module === 'shooting') {
                        return (
                          <span key={b._id} className="text-[8px] bg-gray-100 text-gray-800 border border-gray-300 truncate px-1 py-0.5 rounded-md font-semibold text-center w-full block shadow-sm" title={`${b.startTime} - ${b.endTime} (${b.peopleCount} People) by ${b.bookingOwnerName}`}>
                            {b.startTime?.replace(/\s*(AM|PM)/i, '')}-{b.endTime?.replace(/\s*(AM|PM)/i, '')} ({b.peopleCount}p)
                          </span>
                        );
                      }
                      if (module === 'marriage' || module === 'banquet') {
                        const typeLabel = b.bookingType === 'full-day' ? 'Full' : b.bookingType === 'morning' ? 'Morning' : 'Evening';
                        const typeColor = b.bookingType === 'full-day' 
                          ? 'bg-black text-white border-black' 
                          : b.bookingType === 'morning' 
                            ? 'bg-gray-100 text-gray-700 border-gray-200' 
                            : 'bg-gray-200 text-gray-800 border-gray-300';
                        return (
                          <span key={b._id} className={`text-[8px] ${typeColor} truncate px-1 py-0.5 rounded-md font-semibold text-center w-full block shadow-sm`} title={`${b.bookingType} by ${b.bookingOwnerName}`}>
                            {typeLabel} ({firstOwnerName})
                          </span>
                        );
                      }
                      return (
                        <span key={b._id} className="text-[8px] bg-gray-50 text-gray-600 border border-dark-border truncate px-1 py-0.5 rounded-md font-semibold text-center w-full block shadow-sm" title={b.timeSlot}>
                          {b.timeSlot} ({firstOwnerName})
                        </span>
                      );
                    })}
                    {info.bookings.length > 2 && (
                      <span className="text-[8px] text-gray-500 leading-none">+{info.bookings.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
