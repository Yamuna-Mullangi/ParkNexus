require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const ParkingSpot = require('./models/ParkingSpot');
const User = require('./models/User');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing parking spots
    await ParkingSpot.deleteMany();

    const parkingSpots = [];

    // Block A - Ground Floor
    for (let i = 1; i <= 5; i++) {
      parkingSpots.push({
        spotNumber: `A-0${i}`,
        zone: 'Community',
        block: 'Block A',
        floor: 'Ground Floor',
        type: i % 2 === 0 ? 'compact' : 'standard',
        status: 'available',
      });
    }

    // Block B - Basement
    for (let i = 1; i <= 5; i++) {
      parkingSpots.push({
        spotNumber: `B-0${i}`,
        zone: 'Community',
        block: 'Block B',
        floor: 'Basement',
        type: 'standard',
        status: i === 1 ? 'occupied' : 'available',
      });
    }
    
    // Add an assigned spot if a resident exists
    const resident = await User.findOne({ role: 'resident' });
    if (resident) {
      parkingSpots.push({
        spotNumber: 'C-01',
        zone: 'Community',
        block: 'Block C',
        floor: 'Ground Floor',
        type: 'large',
        status: 'assigned',
        assignedTo: resident._id,
      });

      // Clear existing vehicles for seeder
      const Vehicle = require('./models/Vehicle');
      await Vehicle.deleteMany();

      const vehicles = [
        {
          owner: resident._id,
          registrationNumber: 'AP 39 AB 1001',
          make: 'Honda',
          model: 'City',
          color: 'White',
          vehicleType: 'car',
          isPrimary: true
        },
        {
          owner: resident._id,
          registrationNumber: 'AP 39 CD 2002',
          make: 'TVS',
          model: 'Jupiter',
          color: 'Black',
          vehicleType: 'scooter',
          isPrimary: false
        }
      ];

      const insertedVehicles = await Vehicle.insertMany(vehicles);
      
      const Visitor = require('./models/Visitor');
      await Visitor.deleteMany();

      const visitors = [
        {
          resident: resident._id,
          fullName: 'Test Visitor One',
          phone: '+91 9876543210',
          purpose: 'Dinner',
          visitDate: new Date(),
          expectedArrival: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          expectedDeparture: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
          vehicle: insertedVehicles[0]._id, // using first vehicle
          status: 'active'
        },
        {
          resident: resident._id,
          fullName: 'Old Visitor',
          phone: '+91 9876543211',
          purpose: 'Delivery',
          visitDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
          expectedArrival: new Date(Date.now() - 1000 * 60 * 60 * 48),
          expectedDeparture: new Date(Date.now() - 1000 * 60 * 60 * 47),
          status: 'completed'
        }
      ];

      const insertedVisitors = await Visitor.insertMany(visitors);

      // Add a pass for the active visitor
      const VisitorPass = require('./models/VisitorPass');
      await VisitorPass.deleteMany();

      const activePass = await VisitorPass.create({
        visitor: insertedVisitors[0]._id,
        passToken: 'PARKNEXUS-VISITOR-TESTPASS123',
        qrPayload: 'PARKNEXUS-VISITOR-TESTPASS123',
        issuedBy: resident._id,
        validFrom: insertedVisitors[0].expectedArrival,
        validUntil: insertedVisitors[0].expectedDeparture,
        status: 'used',
        used: true
      });
      
      const insertedSpots = await ParkingSpot.insertMany(parkingSpots);
      
      // Update one spot for visitor
      await ParkingSpot.findByIdAndUpdate(insertedSpots[1]._id, { status: 'occupied' });

      // Seed a Reservation
      const Reservation = require('./models/Reservation');
      await Reservation.deleteMany();
      await Reservation.create({
        parkingSpot: insertedSpots[0]._id,
        user: resident._id,
        vehicle: insertedVehicles[0]._id,
        startTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hr ago
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hrs from now
        status: 'active',
        purpose: 'Work'
      });
      
      // Seed a GateEntry
      const GateEntry = require('./models/GateEntry');
      let securityUser = await User.findOne({ role: 'security' });
      if (!securityUser) {
        securityUser = await User.create({
          name: 'Test Security',
          email: 'security@parknexus.com',
          password: 'password123',
          role: 'security'
        });
      }
      await GateEntry.deleteMany();
      const activeEntry = await GateEntry.create({
        visitor: insertedVisitors[0]._id,
        visitorPass: activePass._id,
        resident: resident._id,
        securityUser: securityUser._id,
        parkingSpot: insertedSpots[1]._id,
        entryTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        expectedExitTime: insertedVisitors[0].expectedDeparture,
        entryGate: 'Main Gate',
        status: 'checked_in',
        notes: 'Arrived early'
      });
      
      // Update visitor status
      await Visitor.findByIdAndUpdate(insertedVisitors[0]._id, { 
        status: 'inside',
        currentGateEntry: activeEntry._id
      });
      
    } else {
      await ParkingSpot.insertMany(parkingSpots);
    }

    console.log('Parking spots, vehicles, visitors, reservations, and gate entries seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
