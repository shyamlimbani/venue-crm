import Booking from '../models/Booking.js';
import { MODULES } from '../config/modules.js';

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

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + (parseInt(parts[1] || '0', 10));
  }
  let [_, hours, minutes, ampm] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

export const validateBookingConflict = async (module, details, excludeId = null) => {
  const reqStart = startOfDay(details.fromDate);
  const reqEnd = endOfDay(details.toDate);

  if (reqEnd < reqStart) {
    return { conflict: true, message: 'To Date cannot be earlier than From Date' };
  }

  const query = {
    module,
    status: 'active',
    fromDate: { $lte: reqEnd },
    toDate: { $gte: reqStart }
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existingBookings = await Booking.find(query);

  for (let d = new Date(reqStart); d <= reqEnd; d.setDate(d.getDate() + 1)) {
    const dStart = startOfDay(d);
    const dEnd = endOfDay(d);
    
    const dayBookings = existingBookings.filter(b => b.fromDate <= dEnd && b.toDate >= dStart);
    
    if (module === MODULES.CRICKET) {
      if (dayBookings.length > 0) {
        return { conflict: true, message: 'Selected date range is not available.' };
      }
    } else if (module === MODULES.SHOOTING) {
      const newStart = timeToMinutes(details.startTime);
      const newEnd = timeToMinutes(details.endTime);

      if (!details.startTime || !details.endTime) {
        return { conflict: true, message: 'Start time and End time are required' };
      }
      if (newStart >= newEnd) {
        return { conflict: true, message: 'Start time must be before End time' };
      }

      for (const b of dayBookings) {
        const extStart = timeToMinutes(b.startTime);
        const extEnd = timeToMinutes(b.endTime);

        if (Math.max(newStart, extStart) < Math.min(newEnd, extEnd)) {
          return { conflict: true, message: 'Selected date range is not available.' };
        }
      }
    } else if (module === MODULES.MARRIAGE || module === MODULES.BANQUET) {
      const newType = details.bookingType;
      if (!newType) {
        return { conflict: true, message: 'Booking type is required' };
      }

      for (const b of dayBookings) {
        const extType = b.bookingType;
        if (extType === 'full-day' || newType === 'full-day' || extType === newType) {
          return { conflict: true, message: 'Selected date range is not available.' };
        }
      }
    } else {
      // Fallback standard slot check
      const { timeSlot } = details;
      const isDup = dayBookings.some(b => b.timeSlot === timeSlot);
      if (isDup) {
        return { conflict: true, message: 'Selected date range is not available.' };
      }
    }
  }

  return { conflict: false };
};

export const getCalendarMonth = async (module, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const bookings = await Booking.find({
    module,
    status: 'active',
    fromDate: { $lte: end },
    toDate: { $gte: start }
  }).select('fromDate toDate timeSlot bookingOwnerName bookingType startTime endTime peopleCount customerName module');

  const dayMap = {};
  bookings.forEach((b) => {
    const bStart = new Date(Math.max(b.fromDate.getTime(), start.getTime()));
    const bEnd = new Date(Math.min(b.toDate.getTime(), end.getTime()));
    
    for (let d = new Date(bStart); d <= bEnd; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(b);
    }
  });

  const days = [];
  const daysInMonth = end.getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayBookings = dayMap[dateKey] || [];
    const count = dayBookings.length;
    const owners = Array.from(new Set(dayBookings.map(b => b.bookingOwnerName).filter(Boolean)));

    let status = 'available';
    if (module === MODULES.CRICKET) {
      if (count >= 1) status = 'full';
    } else if (module === MODULES.SHOOTING) {
      if (count > 0) status = 'partial'; // No max slots for manual intervals
    } else if (module === MODULES.MARRIAGE || module === MODULES.BANQUET) {
      const hasFullDay = dayBookings.some(b => b.bookingType === 'full-day');
      const hasMorning = dayBookings.some(b => b.bookingType === 'morning');
      const hasEvening = dayBookings.some(b => b.bookingType === 'evening');

      if (hasFullDay || (hasMorning && hasEvening)) {
        status = 'full';
      } else if (hasMorning || hasEvening) {
        status = 'partial';
      }
    }

    days.push({ 
      date: dateKey, 
      day: d, 
      count, 
      status, 
      owners, 
      bookings: dayBookings 
    });
  }

  return days;
};

export const checkDuplicateBooking = async (module, fromDate, toDate, timeSlot, excludeId = null) => {
  const res = await validateBookingConflict(module, { fromDate, toDate, timeSlot }, excludeId);
  return res.conflict;
};
