const express = require('express');
const router = express.Router();

// Importamos el controlador (asumiendo que el archivo es 'report.controller.js' como salió en tu error anterior)
const ReportController = require('../controllers/report.controller');

// Importamos seguridad (solo admins deberían ver reportes)
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Ruta para estadísticas del Dashboard
router.route('/admin/dashboard').get(
    isAuthenticatedUser, 
    authorizeRoles('admin'), 
    ReportController.getDashboardStats
);

// Ruta para gráfica de ventas
router.route('/admin/sales').get(
    isAuthenticatedUser, 
    authorizeRoles('admin'), 
    ReportController.getSalesChart
);

module.exports = router;