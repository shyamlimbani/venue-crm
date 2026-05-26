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

export const validateBookingConflict = async (module, date, details, excludeId = null) => {
  const start = startOfDay(date);
  const end = endOfDay(date);

  const query = {
    module,
    status: 'active',
    date: { $gte: start, $lte: end },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existingBookings = await Booking.find(query);

  if (module === MODULES.CRICKET) {
    if (existingBookings.length > 0) {
      return { conflict: true, message: 'This date is already fully booked' };
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

    for (const b of existingBookings) {
      const extStart = timeToMinutes(b.startTime);
      const extEnd = timeToMinutes(b.endTime);

      if (Math.max(newStart, extStart) < Math.min(newEnd, extEnd)) {
        return { 
          conflict: true, 
          message: `Time slot overlaps with ${b.customerName}'s booking (${b.startTime} - ${b.endTime})` 
        };
      }
    }
  } else if (module === MODULES.MARRIAGE || module === MODULES.BANQUET) {
    const newType = details.bookingType;
    if (!newType) {
      return { conflict: true, message: 'Booking type is required' };
    }

    for (const b of existingBookings) {
      const extType = b.bookingType;
      if (extType === 'full-day' || newType === 'full-day') {
        return { 
          conflict: true, 
          message: `Conflicting booking exists: ${b.customerName} (${extType === 'full-day' ? 'Full Day' : extType === 'morning' ? 'Morning' : 'Evening'})` 
        };
      }
      if (extType === newType) {
        return { 
          conflict: true, 
          message: `Conflicting booking exists: ${b.customerName} (${extType === 'morning' ? 'Morning' : 'Evening'})` 
        };
      }
    }
  } else {
    // Fallback standard slot check
    const { timeSlot } = details;
    const isDup = existingBookings.some(b => b.timeSlot === timeSlot);
    if (isDup) {
      return { conflict: true, message: 'This slot is already booked' };
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
    date: { $gte: start, $lte: end },
  }).select('date timeSlot bookingOwnerName bookingType startTime endTime peopleCount customerName');

  const dayMap = {};
  bookings.forEach((b) => {
    const key = b.date.toISOString().split('T')[0];
    if (!dayMap[key]) dayMap[key] = [];
    dayMap[key].push(b);
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

export const checkDuplicateBooking = async (module, date, timeSlot, excludeId = null) => {
  const res = await validateBookingConflict(module, date, { timeSlot }, excludeId);
  return res.conflict;
};
