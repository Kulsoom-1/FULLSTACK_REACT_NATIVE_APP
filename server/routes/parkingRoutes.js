const express = require('express');
const { parkController, unParkController, slotsController, maintenanceController, backToWorkingStateController, statisticsController, parkingStatusController } = require('../controllers/parkController');

const router = express.Router();

router.post('/park', parkController);
  
// Route to unpark a vehicle
router.post('/unpark', unParkController);
  
// Route to view current parking lot status
router.get('/status', parkingStatusController);
  
// Route to put a parking slot into maintenance mode
router.put('/maintenance/:id', maintenanceController);
  
// Route to bring a parking slot back to working state
router.put('/maintenance/end/:id', backToWorkingStateController);
  
// Route to get total statistics
router.get('/statistics', statisticsController);

router.get('/slots', slotsController);


module.exports = router;