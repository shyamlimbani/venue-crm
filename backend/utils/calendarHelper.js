import Booking from '../models/Booking.js';
import { CRICKET_SLOTS, MODULES } from '../config/modules.js';

const startOfDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getSlotsForModule = (module) => {
  if (module === MODULES.CRICKET) return CRICKET_SLOTS.map((s) => s.id);
  if (module === MODULES.SHOOTING) {
    return Array.from({ length: 12 }, (_, i) => {
      const h = 8 + i;
      return `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`;
    });
  }
  if (module === MODULES.MARRIAGE) return ['full-day'];
  if (module === MODULES.BANQUET) return ['half-day-morning', 'half-day-evening', 'full-day'];
  return [];
};

export const getCalendarMonth = async (module, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const maxSlots = getSlotsForModule(module).length;

  const bookings = await Booking.find({
    module,
    status: 'active',
    date: { $gte: start, $lte: end },
  }).select('date timeSlot');

  const dayMap = {};
  bookings.forEach((b) => {
    const key = b.date.toISOString().split('T')[0];
    if (!dayMap[key]) dayMap[key] = new Set();
    dayMap[key].add(b.timeSlot);
  });

  const days = [];
  const daysInMonth = end.getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const bookedSlots = dayMap[dateKey]?.size || 0;
    const count = bookings.filter(
      (b) => b.date.toISOString().split('T')[0] === dateKey
    ).length;

    let status = 'available';
    if (bookedSlots >= maxSlots && maxSlots > 0) status = 'full';
    else if (bookedSlots > 0) status = 'partial';

    days.push({ date: dateKey, day: d, count, bookedSlots, maxSlots, status });
  }

  return days;
};

export const checkDuplicateBooking = async (module, date, timeSlot, excludeId = null) => {
  const query = {
    module,
    timeSlot,
    status: 'active',
    date: { $gte: startOfDay(date), $lte: endOfDay(date) },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Booking.findOne(query);
  return !!existing;
};
