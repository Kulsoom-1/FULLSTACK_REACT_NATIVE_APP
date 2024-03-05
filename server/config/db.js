const mongoose = require('mongoose');
const colors = require('colors');
const { initializeParkingSlots } = require('../controllers/parkController');

const MONGODB_URI = 'mongodb+srv://kulsoomirshad17:duaHussain1@cluster0.pvqpzia.mongodb.net/parkingLotDB';
const connectDB = async () => {
try{ 
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB: ", mongoose.connection.host);
    initializeParkingSlots()
}catch(err){
    console.log("Error connecting to DB: " + err.message);
}
}

module.exports = connectDB;