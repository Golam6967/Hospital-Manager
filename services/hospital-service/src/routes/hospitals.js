const express = require('express');
const router = express.Router();
const controller = require('../controllers/hospitalController');
const authorize = require('../middleware/authorize');

const writeRoles = authorize('ADMIN', 'MANAGER');

// GET routes — public (gateway secret still required by trustedGateway middleware at server level)
router.get('/docs', controller.getDocumentation);
router.get('/stats', controller.getStatistics);
router.get('/emergency', controller.getEmergencyHospitals);
router.get('/filter/advanced', controller.filterHospitals);
router.get('/distinct/:field', controller.getDistinctValues);
router.get('/', controller.getAllHospitals);
router.get('/:id', controller.getHospitalById);

// Write routes — require ADMIN or MANAGER role
router.post('/:id/geocode', writeRoles, controller.geocodeHospitalById);
router.post('/', writeRoles, controller.createHospital);
router.put('/:id', writeRoles, controller.updateHospital);
router.delete('/delete/by-filter', writeRoles, controller.deleteByFilter);
router.delete('/delete-all', writeRoles, controller.deleteAllHospitals);
router.delete('/:id', writeRoles, controller.deleteHospital);

module.exports = router;
