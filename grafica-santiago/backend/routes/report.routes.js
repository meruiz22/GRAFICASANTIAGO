const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Rutas de reportes (Solo Admin debería verlas)
router.get('/sales', isAuthenticatedUser, authorizeRoles('admin'), reportController.getSalesReport);
router.get('/best-sellers', isAuthenticatedUser, authorizeRoles('admin'), reportController.getBestSellers);
router.get('/low-stock', isAuthenticatedUser, authorizeRoles('admin'), reportController.getLowStock);
router.get('/top-customers', isAuthenticatedUser, authorizeRoles('admin'), reportController.getTopCustomers);
router.get('/payment-methods', isAuthenticatedUser, authorizeRoles('admin'), reportController.getPaymentMethods);

module.exports = router;