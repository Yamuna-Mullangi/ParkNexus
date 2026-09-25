const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  make: {
    type: String,
    required: true,
    trim: true,
  },
  model: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'motorcycle', 'scooter', 'bicycle', 'other'],
  },
  year: {
    type: Number,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

// Ensure a user can only have one primary vehicle
vehicleSchema.pre('save', async function (next) {
  if (this.isModified('isPrimary') && this.isPrimary) {
    await this.constructor.updateMany(
      { owner: this.owner, _id: { $ne: this._id } },
      { $set: { isPrimary: false } }
    );
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
