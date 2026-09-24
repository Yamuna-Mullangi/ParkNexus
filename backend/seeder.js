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
    }

    await ParkingSpot.insertMany(parkingSpots);

    console.log('Parking spots seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
