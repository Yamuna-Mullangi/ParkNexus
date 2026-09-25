const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const Visitor = require('../models/Visitor');
const GateEntry = require('../models/GateEntry');
const User = require('../models/User');

const generateCSV = (data) => {
  if (!data || !data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

const generateReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let data = [];
    let filename = `${type}_report.csv`;

    switch (type) {
      case 'parking':
        // For parking, createdAt filter might not make as much sense as just current snapshot,
        // but we'll apply it if needed. Usually snapshot is better.
        const spots = await ParkingSpot.find({});
        data = spots.map(s => ({
          SpotNumber: s.spotNumber,
          Zone: s.zone,
          Block: s.block,
          Floor: s.floor,
          Type: s.type,
          Status: s.status,
          IsActive: s.isActive ? 'Yes' : 'No'
        }));
        break;

      case 'reservations':
        const resList = await Reservation.find(query).populate('parkingSpot user');
        data = resList.map(r => ({
          ID: r._id,
          Spot: r.parkingSpot ? r.parkingSpot.spotNumber : 'N/A',
          User: r.user ? r.user.name : 'N/A',
          StartTime: r.startTime.toISOString(),
          EndTime: r.endTime.toISOString(),
          Status: r.status,
          Purpose: r.purpose || ''
        }));
        break;

      case 'visitors':
        const visitors = await Visitor.find(query).populate('resident');
        data = visitors.map(v => ({
          Name: v.name,
          Phone: v.phone,
          Resident: v.resident ? v.resident.name : 'N/A',
          ExpectedDate: v.expectedDate ? v.expectedDate.toISOString() : '',
          Status: v.status,
          Type: v.visitorType
        }));
        break;

      case 'gate':
        const gates = await GateEntry.find(query).populate('visitor parkingSpot resident');
        data = gates.map(g => ({
          Gate: g.entryGate,
          Visitor: g.visitor ? g.visitor.name : 'N/A',
          Resident: g.resident ? g.resident.name : 'N/A',
          Spot: g.parkingSpot ? g.parkingSpot.spotNumber : 'N/A',
          EntryTime: g.entryTime ? g.entryTime.toISOString() : '',
          ExitTime: g.actualExitTime ? g.actualExitTime.toISOString() : '',
          Status: g.status
        }));
        break;
        
      case 'users':
        const users = await User.find(query);
        data = users.map(u => ({
          Name: u.name,
          Email: u.email,
          Phone: u.phone,
          Role: u.role,
          IsActive: u.isActive ? 'Yes' : 'No',
          CreatedAt: u.createdAt.toISOString()
        }));
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid report type' });
    }

    const csvString = generateCSV(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvString);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  generateReport
};
