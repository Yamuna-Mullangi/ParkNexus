const operationsCalendarService = require('../services/operationsCalendarService');

const getCalendar = async (req, res) => {
  try {
    const { startDate, endDate, types } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const events = await operationsCalendarService.getCalendarEvents({
      user: req.user.id,
      role: req.user.role,
      startDate,
      endDate,
      types
    });

    res.json({ success: true, data: events });
  } catch (err) {
    if (err.message.includes('Invalid date') || err.message.includes('exceeds maximum allowed limit')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Error in getCalendar:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getCalendar
};
