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
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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

  const getTimeSlotLabel = (b) => {
    if (b.module === 'cricket') return 'Full Day';
    if (b.module === 'shooting') return `${b.startTime?.replace(/\s*(AM|PM)/i, '')}-${b.endTime?.replace(/\s*(AM|PM)/i, '')}`;
    if (b.module === 'marriage' || b.module === 'banquet') {
      return b.bookingType === 'full-day' ? 'Full' : b.bookingType === 'morning' ? 'Morning' : 'Evening';
    }
    return b.timeSlot || 'Booked';
  };

  const renderCell = (dayNum, dateStr, info, isSelected, st) => {
    const isTodayDate = dateStr === format(new Date(), 'yyyy-MM-dd');
    const tooltip = getTooltipText(dateStr, info);

    const baseBg = isSelected 
      ? 'bg-neutral-50' 
      : isTodayDate 
        ? 'bg-neutral-100/90' 
        : 'bg-white';
        
    const borderStyle = 'hover:bg-neutral-50/70';

    return (
      <button
        key={dateStr}
        onClick={() => onDateSelect(dateStr)}
        title={tooltip}
        className={`border-r border-b border-gray-200 text-sm font-medium transition-all duration-150
          flex flex-col items-center justify-start p-1 gap-1 w-full relative
          min-h-[44px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px]
          ${baseBg} ${borderStyle}`}
      >
        {/* Cell Header: Date number & Booking Indicator Dot */}
        <div className="w-full flex items-center justify-end leading-none p-0.5">
          <div className={`text-[10px] sm:text-xs font-semibold ${
            isTodayDate || isSelected ? 'text-black font-extrabold' : 'text-gray-500'
          } flex items-start gap-1 ml-auto pr-0.5 pt-0.5`}>
            <span>{dayNum}</span>
            {info?.count > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0 mt-0.5" title="Booked" />
            )}
          </div>
        </div>

        {/* Desktop View: Full-width compact booking cards inside cell */}
        {info?.bookings?.length > 0 && (
          <div className="hidden md:flex flex-col gap-1 w-full overflow-hidden mt-0.5">
            {info.bookings.slice(0, 2).map((b) => {
              const venueLabel = MODULES[b.module]?.label || b.module;
              const VenueIcon = MODULES[b.module]?.icon;
              
              return (
                <div
                  key={b._id}
                  className="w-full bg-black text-white rounded-md p-1 flex flex-col items-start gap-0.5 text-left shadow-sm select-none border border-black hover:bg-neutral-900 transition-colors"
                >
                  {/* Time slot with Clock emoji */}
                  <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] text-gray-300 font-medium tracking-tight truncate w-full">
                    <span className="shrink-0">🕒</span>
                    <span className="truncate">{getTimeSlotLabel(b)}</span>
                  </div>
                  {/* Venue icon + customer name */}
                  <div className="flex items-center gap-1 w-full font-bold text-[9px] sm:text-[10px] text-white tracking-tight truncate">
                    {VenueIcon && <VenueIcon size={9} className="stroke-[2.5] text-white shrink-0" />}
                    <span className="truncate">{b.customerName}</span>
                  </div>
                </div>
              );
            })}
            {info.bookings.length > 2 && (
              <span className="text-[8.5px] font-bold text-gray-500 block text-left pl-1 hover:text-black transition-colors">
                +{info.bookings.length - 2} more
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="card-modern relative flex flex-col h-[calc(100vh-280px)] min-h-[480px] overflow-hidden p-4 md:p-5">
      {/* Header, Legend, and Weekday headers fixed on top */}
      <div className="shrink-0 bg-white border-b border-gray-100 mb-4 pb-2">
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
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-gray-300" /> Available
          </span>
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Booked
          </span>
        </div>

        {/* Week Day Labels */}
        <div className="grid grid-cols-7 gap-0 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2 border-b border-gray-100">
              <span className="hidden sm:inline">{d}</span>
              <span className="inline sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid container with overflow protection - Scrolls internally */}
      <div className="flex-1 overflow-y-auto overflow-x-auto overscroll-contain scrollbar-thin pr-0.5">
        <div className="min-w-[280px]">
          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mb-2">
              {view === 'month' ? (
                <>
                  {blanks.map((_, i) => (
                    <div 
                      key={`b-${i}`} 
                      className="w-full border-r border-b border-gray-200 bg-gray-50/40 min-h-[44px] sm:min-h-[64px] md:min-h-[72px] lg:min-h-[80px]" 
                    />
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
