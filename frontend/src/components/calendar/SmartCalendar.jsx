import { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  getDaysInMonth,
  getDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks
} from 'date-fns';
import api from '../../api/axios';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MODULES } from '../../utils/constants';

const statusClass = {
  available: 'cal-available',
  partial: 'cal-partial',
  full: 'cal-full',
};

export default function SmartCalendar({ module, onDateSelect, selectedDate }) {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' or 'week'
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        if (view === 'month') {
          const { data } = await api.get(`/api/calendar/${module}`, {
            params: { year, month }
          });
          setDays(data.data.days || []);
        } else {
          // Week view: check if it spans two months
          const startW = startOfWeek(current);
          const endW = endOfWeek(current);
          const startYear = startW.getFullYear();
          const startMonth = startW.getMonth() + 1;
          const endYear = endW.getFullYear();
          const endMonth = endW.getMonth() + 1;

          if (startYear !== endYear || startMonth !== endMonth) {
            const [res1, res2] = await Promise.all([
              api.get(`/api/calendar/${module}`, { params: { year: startYear, month: startMonth } }),
              api.get(`/api/calendar/${module}`, { params: { year: endYear, month: endMonth } })
            ]);
            const days1 = res1.data.data.days || [];
            const days2 = res2.data.data.days || [];
            setDays([...days1, ...days2]);
          } else {
            const { data } = await api.get(`/api/calendar/${module}`, {
              params: { year: startYear, month: startMonth }
            });
            setDays(data.data.days || []);
          }
        }
      } catch {
        setDays([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [module, current, view]);

  const handlePrev = () => {
    if (view === 'month') {
      setCurrent(subMonths(current, 1));
    } else {
      setCurrent(subWeeks(current, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrent(addMonths(current, 1));
    } else {
      setCurrent(addWeeks(current, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrent(today);
    onDateSelect(format(today, 'yyyy-MM-dd'));
  };

  const firstDay = getDay(startOfMonth(current));
  const blanks = Array(firstDay).fill(null);
  const dayMap = Object.fromEntries(days.map((d) => [d.date, d]));

  const daysInWeek = eachDayOfInterval({
    start: startOfWeek(current),
    end: endOfWeek(current),
  });

  const getTooltipText = (dateStr, info) => {
    const formattedDate = format(new Date(dateStr + 'T00:00:00'), 'eeee, d MMMM yyyy');
    const venueLabel = MODULES[module]?.label || module;
    const count = info?.count || 0;
    
    if (count === 0) {
      return `${formattedDate}\nVenue: ${venueLabel}\nStatus: Available`;
    }
    
    const customerNames = info.bookings?.map(b => b.customerName).filter(Boolean).join(', ') || 'None';
    return `${formattedDate}\nVenue: ${venueLabel}\nBookings: ${count}\nCustomers: ${customerNames}`;
  };

  const renderIndicator = (count, isFullCell) => {
    if (!count || count <= 0) return null;

    if (isFullCell) {
      // Fully booked: light red badge
      return (
        <span 
          className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0 shadow-sm"
          title="Fully Booked"
        >
          {count}
        </span>
      );
    }

    // Booked Date: Green dot (1 booking)
    if (count === 1) {
      return (
        <span 
          className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 shadow-sm" 
          title="1 Booking"
        />
      );
    }

    // Multiple Bookings: Green badge (2-5 bookings)
    return (
      <span 
        className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 shrink-0 shadow-sm"
        title={`${count} Bookings`}
      >
        {count}
      </span>
    );
  };

  const renderCell = (dayNum, dateStr, info, isSelected, st) => {
    const isTodayDate = dateStr === format(new Date(), 'yyyy-MM-dd');
    const tooltip = getTooltipText(dateStr, info);

    return (
      <button
        key={dateStr}
        onClick={() => onDateSelect(dateStr)}
        title={tooltip}
        className={`rounded-xl border text-sm font-medium transition-all duration-200
          flex flex-col items-center justify-start p-1 sm:py-2 gap-0.5 min-h-[48px] sm:min-h-[80px] md:min-h-[100px] lg:min-h-[120px] w-full
          ${statusClass[st]} ${
            isTodayDate ? 'ring-1 ring-black ring-offset-1 font-bold z-10' : ''
          } ${
            isSelected
              ? 'ring-2 ring-black ring-offset-2 scale-105 z-20 font-semibold shadow-sm'
              : 'hover:scale-[1.03] hover:bg-gray-50'
          }`}
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className={isSelected ? 'text-black font-bold' : 'text-gray-800 font-semibold'}>
            {dayNum}
          </span>
          {renderIndicator(info?.count, st === 'full')}
        </div>

        {/* Desktop View: detailed booking list */}
        {info?.bookings?.length > 0 && (
          <div className="hidden md:flex flex-col gap-1 mt-1.5 w-full px-1 overflow-hidden">
            {info.bookings.slice(0, 3).map((b) => {
              const firstOwnerName = b.bookingOwnerName?.split(' ')[0] || 'Owner';
              const venueLabel = MODULES[b.module]?.label || b.module;
              return (
                <span
                  key={b._id}
                  className="text-[8px] bg-gray-50 text-gray-700 border border-gray-250 truncate px-1.5 py-0.5 rounded-full font-semibold text-left w-full block shadow-sm"
                >
                  {firstOwnerName} · {b.customerName} · {venueLabel}
                </span>
              );
            })}
            {info.bookings.length > 3 && (
              <span className="text-[8px] text-gray-500 font-semibold mt-0.5 block text-center">
                +{info.bookings.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Mobile View: minimal dot indicators to avoid overflow */}
        {info?.bookings?.length > 0 && (
          <div className="flex md:hidden items-center justify-center gap-0.5 mt-1.5 flex-wrap px-0.5">
            {info.bookings.slice(0, 3).map((b, idx) => (
              <span
                key={b._id || idx}
                className={`w-1.5 h-1.5 rounded-full ${st === 'full' ? 'bg-red-500' : 'bg-green-500'}`}
              />
            ))}
            {info.bookings.length > 3 && (
              <span className={`text-[8px] font-bold leading-none ${st === 'full' ? 'text-red-700' : 'text-green-700'}`}>
                +
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="card-modern relative">
      {/* Sticky wrapper for header and day labels */}
      <div className="sticky top-0 bg-white z-20 pt-2 pb-2 border-b border-gray-100 mb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-gray-900 font-bold text-lg md:text-xl tracking-tight">
              {view === 'month'
                ? format(current, 'MMMM yyyy')
                : `Week of ${format(startOfWeek(current), 'd MMM')} - ${format(endOfWeek(current), 'd MMM yyyy')}`}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nav controls */}
            <div className="flex items-center gap-1 bg-white border border-dark-border rounded-lg p-0.5 shadow-sm">
              <button
                onClick={handlePrev}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-black transition-colors"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View toggles */}
            <div className="flex items-center bg-gray-100 border border-dark-border rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  view === 'month'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  view === 'week'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-2 text-xs font-medium">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-3.5 h-3.5 rounded-sm bg-white border border-gray-300" /> Available
          </span>
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-3.5 h-3.5 rounded-sm bg-white border border-gray-200 border-l-2 border-l-green-500" /> Booked
          </span>
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-3.5 h-3.5 rounded-sm bg-white border border-gray-200 border-l-2 border-l-red-500" /> Fully Booked
          </span>
        </div>

        {/* Week Day Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">
              <span className="hidden sm:inline">{d}</span>
              <span className="inline sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid container with overflow protection */}
      <div className="overflow-x-auto overscroll-x-contain scrollbar-thin">
        <div className="min-w-[280px]">
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-7 gap-1 sm:gap-2 pb-2">
              {view === 'month' ? (
                <>
                  {blanks.map((_, i) => (
                    <div key={`b-${i}`} className="w-full" />
                  ))}
                  {Array.from({ length: getDaysInMonth(current) }, (_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const info = dayMap[dateStr];
                    const isSelected = selectedDate === dateStr;
                    const st = info?.status || 'available';

                    return renderCell(day, dateStr, info, isSelected, st);
                  })}
                </>
              ) : (
                daysInWeek.map((dayDate) => {
                  const dateStr = format(dayDate, 'yyyy-MM-dd');
                  const info = dayMap[dateStr];
                  const isSelected = selectedDate === dateStr;
                  const st = info?.status || 'available';
                  const dayNum = dayDate.getDate();

                  return renderCell(dayNum, dateStr, info, isSelected, st);
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
