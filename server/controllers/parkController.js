const mongoose = require('mongoose');
const ParkingRecord = require('../models/parkingRecordModal')
const ParkingSlot = require('../models/parkingSlotsModal')

const initializeParkingSlots = async () => {
  try {
    // Check if any slots already exist
    const existingSlots = await ParkingSlot.find({});

    if (existingSlots.length === 0) {
      // Create 10 parking slots with inMaintenance set to false
      const initialSlots = Array.from({ length: 10 }, (_, index) => ({
        slotNumber: index + 1,
        inMaintenance: false,
      }));

      // Insert the initial slots into the ParkingSlot table
      await ParkingSlot.insertMany(initialSlots);

      console.log('Parking slots initialized successfully.');
    } else {
      console.log('Parking slots already exist.');
    }

  } catch (error) {
    console.error('Error initializing parking slots:', error);
    process.exit(1); // Terminate the script with an error code
  }
}

const parkController = async (req, res) => {
  try {
    const { vehicleNumber } = req.body;
    
    const availableSlot = await ParkingSlot.findOne({ inMaintenance: false, status: 'empty' })
      .sort({ slotNumber: 1 })
      .exec();

    if (!availableSlot) {
      return res.status(400).json({
        success: false,
        message: 'No parking slot available!',
      });
    }

    const newRecord = new ParkingRecord({
      slotNumber: availableSlot.slotNumber,
      vehicleNumber,
      entryTime: new Date(),
    });

    await availableSlot.updateOne({status: "booked"});

    const result = await newRecord.save();
    return res.json({
      success: true,
      message: `Vehicle parked with ID: ${result._id}`,
    });
  } catch (error) {
    console.error('Error parking vehicle:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error' + error,
    });
  }
};

  // Route to unpark a vehicle
  const unParkController = async (req, res) => {
    const { vehicleNumber } = req.body;
  
    try {
      const parkedVehicle = await ParkingRecord.findOne({ vehicleNumber });
     
      if (parkedVehicle) {
        const slotNumber = parkedVehicle.slotNumber;
        const slot = await ParkingSlot.findOne({ slotNumber})
        await slot.updateOne({status: "empty"})
        await ParkingRecord.deleteOne();
        const exitTime = new Date();
        const parkingDuration = Math.ceil((exitTime - parkedVehicle.entryTime) / (60 * 60 * 1000)); // in hours
        const parkingFee = parkingDuration * 10;
        res.json({
          success: true,
          message: 'Vehicle unparked successfully',
          parkingFee,
        });

      } else {
        res.status(404).json({
          success: false,
          message: 'Vehicle not found in the parking lot',
        });
      }
    } catch (error) {
      console.error('Error unparking vehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
  
  // Route to view current parking lot status
  const parkingStatusController = async (req, res) => {
    try {
      const parkingLot = await ParkingRecord.find({}).exec();
  
      res.json({
        success: true,
        parkingLot,
      });
    } catch (error) {
      console.error('Error getting parking lot status:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  const  toggleMaintenanceStatus = async (slotNumber, inMaintenance) => {
    try {
      // Find the parking slot by its number
      const parkingSlot = await ParkingSlot.findOne({ slotNumber });
      if (!parkingSlot) {
        throw new Error(`Parking slot ${slotNumber} not found.`);
      }
  
      await parkingSlot.updateOne({inMaintenance});
  
      console.log(`Parking slot ${slotNumber} is now ${parkingSlot.inMaintenance ? 'in maintenance' : 'not in maintenance'}.`);
  
    } catch (error) {
      console.error('Error toggling maintenance status:', error.message);
    }
  }

  const slotsController = async (req, res) => {
    try{
      const slots = await ParkingSlot.find()
      .sort({ slotNumber: 1 })
      .exec();
  

      res.status(200).json({
        success: true,
        message: 'List of Slots',
        slots,
      });
    }catch(e){
      res.status(500).json({
        success: false,
        message: 'Internal server error' + e.message,
      });
    }
    
  }
  
  // Route to put a parking slot into maintenance mode
  const maintenanceController =  async (req, res) => {
    const { id } = req.params;

    console.log(id, "maintainance");
  
    try {
      toggleMaintenanceStatus(id, true).then(async () =>{
        const slots = await ParkingSlot.find()
        .sort({ slotNumber: 1 })
        .exec();
        res.json({
          success: true,
          message: `Parking slot with ID ${id} is now in maintenance mode`,
          slots,
        });
      }).catch((err) => {
        res.status(400).json({
          success: false,
          message: err.message,
        });
      })
    } catch (error) {
      console.error('Error putting slot into maintenance mode:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
  
  // Route to bring a parking slot back to working state
  const backToWorkingStateController = async (req, res) => {
    const { id } = req.params;
  
    try {
       toggleMaintenanceStatus(id, false).then(async() =>{
        const slots = await ParkingSlot.find()
        .sort({ slotNumber: 1 })
        .exec();
        res.json({
          success: true,
          message: `Parking slot with ID ${id} is now in working state`,
          slots
        });
      }).catch((err) => {
        res.status(400).json({
          success: false,
          message: err.message,
        });
      })
    } catch (error) {
      console.error('Error bringing Parking Slot back to working state:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
  
  // Route to get total statistics
  const statisticsController = async (req, res) => {
    try {
    const totalSlots = await ParkingSlot.countDocuments({});
    const maintenanceSlots = await ParkingSlot.countDocuments({ inMaintenance: true });
    const totalParkedVehicles = await ParkingRecord.countDocuments({ exitTime: null });
    const totalRevenue = await ParkingRecord.aggregate([
      {
        $match: { exitTime: { $ne: null } },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$chargedAmount' },
        },
      },
    ]);

    const statistics = {
      totalSlots,
      maintenanceSlots,
      totalParkedVehicles,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalAmount : 0,
    };

    res.json({
      success: true,
      ...statistics
    });

    console.log('Total Statistics:', statistics);

  } catch (error) {
    console.error('Error getting total statistics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
  };

module.exports = {
    parkController,
    unParkController,
    maintenanceController,
    backToWorkingStateController,
    statisticsController,
    parkingStatusController,
    initializeParkingSlots,
    slotsController
}