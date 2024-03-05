const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const colors = require('colors');
const connectDB = require('./config/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

connectDB()

// const parkingRecordSchema = new mongoose.Schema({
//   vehicleNumber: String,
//   parkedAt: { type: Date, default: Date.now },
//   // Add more fields as needed
// });

// const ParkingRecord = mongoose.model('ParkingRecord', parkingRecordSchema);
app.get("", (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to full stack app',
  });
})

app.use("/api/parking", require("./routes/parkingRoutes"));

// Route to park a vehicle


app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
