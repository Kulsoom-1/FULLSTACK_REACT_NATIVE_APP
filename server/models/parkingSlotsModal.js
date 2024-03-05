const mongoose = require('mongoose');

const validateSlotNumber = async function (value) {
  if (value < 1 || value > 10) {
    throw new Error('Invalid parking slot. Must be between 1 and 10.');
  }

  // Check if the parking slot is already taken
  const existingSlot = await this.constructor.findOne({ slotNumber: value });
  if (existingSlot) {
    throw new Error(`Parking slot ${value} is already taken.`);
  }

  return true;
};

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: [true, 'Please add slot'],
    unique: true,
    validate: [validateSlotNumber, 'Invalid parking slot.'],
  },
  inMaintenance: { type: Boolean, default: false },
  status: { type: String, enum: ['empty', 'booked'], default: 'empty' },
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
