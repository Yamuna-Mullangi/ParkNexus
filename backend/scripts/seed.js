require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');
const Vehicle = require('../models/Vehicle');
const Reservation = require('../models/Reservation');
const ParkingShare = require('../models/ParkingShare');
const ShareRequest = require('../models/ShareRequest');
const Visitor = require('../models/Visitor');
const VisitorPass = require('../models/VisitorPass');
const GateEntry = require('../models/GateEntry');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const FavoriteParking = require('../models/FavoriteParking');
const RecentParkingView = require('../models/RecentParkingView');

const DEMO_DOMAIN = '@parknexus.dev';

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Cannot run seed script in production environment.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connection: SUCCESS');

    // 1. Clean up existing demo data
    console.log('Cleaning up existing demo data...');
    const demoUsers = await User.find({ email: { $regex: DEMO_DOMAIN } });
    const demoUserIds = demoUsers.map(u => u._id);

    await RecentParkingView.deleteMany({ user: { $in: demoUserIds } });
    await FavoriteParking.deleteMany({ user: { $in: demoUserIds } });
    await ActivityLog.deleteMany({ user: { $in: demoUserIds } });
    await Notification.deleteMany({ recipient: { $in: demoUserIds } });
    await GateEntry.deleteMany({ $or: [{ resident: { $in: demoUserIds } }, { securityUser: { $in: demoUserIds } }] });
    await VisitorPass.deleteMany({ issuedBy: { $in: demoUserIds } });
    await Visitor.deleteMany({ resident: { $in: demoUserIds } });
    await ShareRequest.deleteMany({ $or: [{ requester: { $in: demoUserIds } }, { owner: { $in: demoUserIds } }] });
    await ParkingShare.deleteMany({ owner: { $in: demoUserIds } });
    await Reservation.deleteMany({ user: { $in: demoUserIds } });
    await Vehicle.deleteMany({ owner: { $in: demoUserIds } });
    await ParkingSpot.deleteMany({ block: { $regex: '^Demo-' } });
    await User.deleteMany({ email: { $regex: DEMO_DOMAIN } });

    // 2. Create Users
    console.log('Creating demo users...');
    const passwordHash = await bcrypt.hash('Demo@12345', 10);
    
    const admin = await User.create({
      name: 'Demo Admin',
      email: 'admin' + DEMO_DOMAIN,
      password: passwordHash,
      role: 'admin',
      isEmailVerified: true
    });

    const security = await User.create({
      name: 'Demo Security',
      email: 'security' + DEMO_DOMAIN,
      password: passwordHash,
      role: 'security',
      isEmailVerified: true
    });

    const resident = await User.create({
      name: 'Demo Resident',
      email: 'resident' + DEMO_DOMAIN,
      password: passwordHash,
      role: 'resident',
      isEmailVerified: true,
      phone: '1234567890'
    });

    const resident2 = await User.create({
      name: 'Demo Resident 2',
      email: 'resident2' + DEMO_DOMAIN,
      password: passwordHash,
      role: 'resident',
      isEmailVerified: true
    });

    // 3. Create Parking Spots
    console.log('Creating parking spots...');
    const spots = [];
    
    // Block Demo-A
    for (let i = 1; i <= 8; i++) {
      spots.push({
        spotNumber: `Demo-A-0${i}`,
        zone: 'North',
        block: 'Demo-A',
        floor: 'Ground',
        type: i === 8 ? 'accessible' : 'standard',
        status: i === 1 ? 'assigned' : i === 2 ? 'occupied' : i === 3 ? 'reserved' : i === 4 ? 'maintenance' : 'available',
        assignedTo: i === 1 ? resident._id : null
      });
    }

    // Block Demo-B (Visitor + Compact)
    for (let i = 1; i <= 8; i++) {
      spots.push({
        spotNumber: `Demo-B-0${i}`,
        zone: 'South',
        block: 'Demo-B',
        floor: 'Basement 1',
        type: i >= 7 ? 'visitor' : 'compact',
        status: i === 7 ? 'occupied' : 'available'
      });
    }

    const createdSpots = await ParkingSpot.insertMany(spots);
    const assignedSpot = createdSpots.find(s => s.spotNumber === 'Demo-A-01');
    const availableSpot = createdSpots.find(s => s.spotNumber === 'Demo-A-05');
    const visitorSpot = createdSpots.find(s => s.spotNumber === 'Demo-B-07');
    const reservedSpot = createdSpots.find(s => s.spotNumber === 'Demo-A-03');

    // Update resident with assigned spot
    if(resident.assignedParkingSpot) {
       resident.assignedParkingSpot = assignedSpot._id;
       await resident.save();
    }

    // 4. Create Vehicles
    console.log('Creating vehicles...');
    const vehicles = await Vehicle.insertMany([
      {
        owner: resident._id,
        registrationNumber: 'TS09AB1234',
        make: 'Hyundai',
        model: 'i20',
        color: 'White',
        vehicleType: 'car',
        isPrimary: true
      },
      {
        owner: resident._id,
        registrationNumber: 'TS09CD5678',
        make: 'Honda',
        model: 'Activa',
        color: 'Black',
        vehicleType: 'scooter',
        isPrimary: false
      }
    ]);
    const vehicle1 = vehicles[0];
    const vehicle2 = vehicles[1];

    // 5. Create Reservations
    console.log('Creating reservations...');
    const now = new Date();
    
    const resActive = await Reservation.create({
      parkingSpot: reservedSpot._id,
      user: resident._id,
      vehicle: vehicle1._id,
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),   // 2 hours from now
      status: 'active',
      totalPrice: 15
    });

    const resUpcoming = await Reservation.create({
      parkingSpot: availableSpot._id,
      user: resident._id,
      vehicle: vehicle1._id,
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(now.getTime() + 28 * 60 * 60 * 1000),
      status: 'approved',
      totalPrice: 20
    });

    const resCompleted = await Reservation.create({
      parkingSpot: availableSpot._id,
      user: resident._id,
      vehicle: vehicle2._id,
      startTime: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(now.getTime() - 44 * 60 * 60 * 1000),
      status: 'completed',
      totalPrice: 10
    });

    // 6. Create Parking Shares
    console.log('Creating parking shares...');
    const shareActive = await ParkingShare.create({
      parkingSpot: assignedSpot._id,
      owner: resident._id,
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 2 days from now
      endTime: new Date(now.getTime() + 96 * 60 * 60 * 1000), // 4 days from now
      status: 'active',
      pricePerHour: 2
    });

    // 7. Create Share Requests
    console.log('Creating share requests...');
    const shareReqPending = await ShareRequest.create({
      parkingShare: shareActive._id,
      requester: resident2._id,
      owner: resident._id,
      requestedStartTime: new Date(now.getTime() + 50 * 60 * 60 * 1000),
      requestedEndTime: new Date(now.getTime() + 54 * 60 * 60 * 1000),
      status: 'pending'
    });

    // 8. Create Visitors
    console.log('Creating visitors...');
    const visitorActive = await Visitor.create({
      resident: resident._id,
      fullName: 'John Smith',
      phone: '9876543210',
      email: 'john@example.com',
      purpose: 'Plumber',
      visitDate: now,
      expectedArrival: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      status: 'inside',
      vehicleDetails: {
        registrationNumber: 'AP01XY9999'
      }
    });

    const visitorUpcoming = await Visitor.create({
      resident: resident._id,
      fullName: 'Jane Doe',
      phone: '9876543211',
      purpose: 'Friend',
      visitDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      expectedArrival: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() + 28 * 60 * 60 * 1000),
      status: 'upcoming'
    });

    const visitorCompleted = await Visitor.create({
      resident: resident._id,
      fullName: 'Bob Builder',
      phone: '9876543212',
      purpose: 'Delivery',
      visitDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expectedArrival: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      status: 'completed'
    });

    // 9. Create Visitor Passes
    console.log('Creating visitor passes...');
    const passActive = await VisitorPass.create({
      visitor: visitorActive._id,
      issuedBy: resident._id,
      passToken: crypto.randomBytes(16).toString('hex'),
      qrPayload: `VISITOR:${visitorActive._id}:${Date.now()}`,
      validFrom: visitorActive.expectedArrival,
      validUntil: visitorActive.expectedDeparture,
      status: 'active'
    });

    const passCompleted = await VisitorPass.create({
      visitor: visitorCompleted._id,
      issuedBy: resident._id,
      passToken: crypto.randomBytes(16).toString('hex'),
      qrPayload: `VISITOR:${visitorCompleted._id}:${Date.now()}`,
      validFrom: visitorCompleted.expectedArrival,
      validUntil: visitorCompleted.expectedDeparture,
      status: 'used'
    });

    // 10. Create Gate Entries
    console.log('Creating gate entries...');
    const gateEntryActive = await GateEntry.create({
      visitor: visitorActive._id,
      visitorPass: passActive._id,
      resident: resident._id,
      securityUser: security._id,
      assignedSpot: visitorSpot._id,
      entryTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
      expectedExitTime: visitorActive.expectedDeparture,
      status: 'checked_in',
      entryGate: 'Main Gate'
    });

    const gateEntryCompleted = await GateEntry.create({
      visitor: visitorCompleted._id,
      visitorPass: passCompleted._id,
      resident: resident._id,
      securityUser: security._id,
      entryTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expectedExitTime: visitorCompleted.expectedDeparture,
      exitTime: new Date(now.getTime() - 23.5 * 60 * 60 * 1000),
      status: 'checked_out',
      entryGate: 'Main Gate',
      exitGate: 'Main Gate'
    });

    // 11. Create Notifications
    console.log('Creating notifications...');
    const notifications = [
      {
        recipient: resident._id,
        type: 'VISITOR_CHECKED_IN',
        title: 'Visitor Arrived',
        message: 'John Smith has checked in at the Main Gate.',
        relatedId: visitorActive._id,
        read: false
      },
      {
        recipient: resident._id,
        type: 'SHARE_REQUESTED',
        title: 'New Share Request',
        message: 'Demo Resident 2 requested to book your shared spot Demo-A-01.',
        relatedId: shareReqPending._id,
        read: false
      },
      {
        recipient: resident._id,
        type: 'RESERVATION_APPROVED',
        title: 'Reservation Approved',
        message: 'Your reservation for spot Demo-A-05 is approved.',
        relatedId: resUpcoming._id,
        read: true
      }
    ];
    await Notification.insertMany(notifications);

    // 12. Create Activity Logs
    console.log('Creating activity logs...');
    const activities = [
      {
        user: resident._id,
        action: 'CREATED',
        entityType: 'Reservation',
        entityId: resUpcoming._id,
        details: 'Created upcoming reservation for A-05',
        ipAddress: '127.0.0.1'
      },
      {
        user: resident._id,
        action: 'CREATED',
        entityType: 'Visitor',
        entityId: visitorUpcoming._id,
        details: 'Created upcoming visitor Jane Doe',
        ipAddress: '127.0.0.1'
      },
      {
        user: security._id,
        action: 'UPDATED',
        entityType: 'GateEntry',
        entityId: gateEntryActive._id,
        details: 'Checked in visitor John Smith',
        ipAddress: '127.0.0.1'
      }
    ];
    await ActivityLog.insertMany(activities);

    // 13. Create Favorites
    console.log('Creating favorites...');
    await FavoriteParking.create([
      { user: resident._id, parkingSpot: availableSpot._id },
      { user: resident._id, parkingSpot: reservedSpot._id }
    ]);

    // 14. Create Recent Parking
    console.log('Creating recent parking views...');
    await RecentParkingView.create([
      { user: resident._id, parkingSpot: availableSpot._id, lastViewed: new Date() },
      { user: resident._id, parkingSpot: assignedSpot._id, lastViewed: new Date(now.getTime() - 10000) }
    ]);

    console.log(`
========================================
ParkNexus Demo Data Seed Complete
========================================

Users
  Resident: resident@parknexus.dev
  Security: security@parknexus.dev
  Admin:    admin@parknexus.dev
  (Password for all: Demo@12345)

Parking Spots:      ${createdSpots.length}
Vehicles:           2
Reservations:       3
Parking Shares:     1
Share Requests:     1
Visitors:           3
Visitor Passes:     2
Gate Entries:       2
Notifications:      3
Activity Logs:      3
Favorites:          2
Recent Parking:     2

Database connection: SUCCESS
========================================
    `);
    
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();






