import { getCalendarMonth } from '../utils/calendarHelper.js';
import { CRICKET_SLOTS, MODULES } from '../config/modules.js';

export const getMonthCalendar = async (req, res) => {
  try {
    const { module } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const days = await getCalendarMonth(module, year, month);
    res.json({ success: true, data: { year, month, module, days } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleConfig = async (req, res) => {
  try {
    const { module } = req.params;
    let slots = [];
    let bookingTypes = [];
    let categories = [];

    if (module === MODULES.CRICKET) {
      slots = CRICKET_SLOTS;
    } else if (module === MODULES.SHOOTING) {
      slots = Array.from({ length: 12 }, (_, i) => {
        const h = 8 + i;
        return {
          id: `${String(h).padStart(2, '0')}:00-${String(h + 1).padStart(2, '0')}:00`,
          label: `${h}:00 - ${h + 1}:00`,
        };
      });
      categories = ['Product Shoot', 'Model Shoot', 'Reels Shoot', 'Pre Wedding Shoot'];
    } else if (module === MODULES.MARRIAGE) {
      slots = [{ id: 'full-day', label: 'Full Day' }];
      bookingTypes = ['Wedding', 'Reception', 'Engagement'];
    } else if (module === MODULES.BANQUET) {
      slots = [
        { id: 'half-day-morning', label: 'Half Day (Morning)' },
        { id: 'half-day-evening', label: 'Half Day (Evening)' },
        { id: 'full-day', label: 'Full Day' },
      ];
      bookingTypes = ['Half Day', 'Full Day', 'Birthday', 'Corporate Event', 'Family Function'];
    }

    res.json({ success: true, data: { module, slots, bookingTypes, categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
