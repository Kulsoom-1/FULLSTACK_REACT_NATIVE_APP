const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
  slotNumber: { type: Number, required: true },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add vehicle number'],
    unique: true,
    validate: {
      validator: async function (value) {
        // Check if the vehicle number is already taken
        const existingVehicle = await this.constructor.findOne({ vehicleNumber: value });
        if (existingVehicle) {
          throw new Error(`Vehicle with number ${value} is already parked.`);
        }

        return true;
      },
      message: 'Vehicle number must be unique.',
    },
  },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date },
  chargedAmount: { type: Number, default: 0 },
});

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
