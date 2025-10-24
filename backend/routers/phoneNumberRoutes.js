const express = require('express');
const {
  getAllPhoneNumbers,
  getPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  getPhoneNumberStats,
  exportToExcel,
  exportToCSV
} = require('../controllers/phoneNumberController');

const router = express.Router();

// Routes
router.get('/', getAllPhoneNumbers);
router.get('/stats', getPhoneNumberStats);
router.get('/export/excel', exportToExcel);
router.get('/export/csv', exportToCSV);
router.get('/:phoneNumberId', getPhoneNumber);
router.put('/:phoneNumberId', updatePhoneNumber);
router.delete('/:phoneNumberId', deletePhoneNumber);

module.exports = router;
