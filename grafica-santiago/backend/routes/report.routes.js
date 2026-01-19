const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');
const { getSummary } = require('../controllers/report.controller'); // Asegúrate que el controlador exista

// La ruta final será: /api/v1/reports/summary
router.get('/summary', isAuthenticatedUser, authorizeRoles('admin'), getSummary);

module.exports = router;