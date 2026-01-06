const express = require('express');
const router = express.Router();

// 1. IMPORTANTE: Importar el middleware con el nombre CORRECTO del archivo
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// 2. Importar el controlador
// (Nota: Si tu controlador exporta un objeto 'AuthController', ajustaremos esto después.
// Pero por ahora asumimos que exporta funciones individuales o un objeto compatible).
const AuthController = require('../controllers/AuthController');

// --- Rutas Públicas (Cualquiera puede entrar) ---
router.route('/register').post(AuthController.registerUser || AuthController.register);
router.route('/login').post(AuthController.loginUser || AuthController.login);
router.route('/password/forgot').post(AuthController.forgotPassword);
router.route('/password/reset/:token').put(AuthController.resetPassword);

// --- Rutas Privadas (Requieren Login) ---
// Aquí es donde probablemente fallaba (Línea 29 aprox): 'isAuthenticatedUser' era undefined
router.route('/logout').get(isAuthenticatedUser, AuthController.logout);
router.route('/me').get(isAuthenticatedUser, AuthController.getUserProfile || AuthController.myProfile);
router.route('/password/update').put(isAuthenticatedUser, AuthController.updatePassword);
router.route('/me/update').put(isAuthenticatedUser, AuthController.updateProfile);

// --- Rutas Admin (Requieren Login + Rol Admin) ---
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), AuthController.allUsers);
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), AuthController.getUserDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), AuthController.updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), AuthController.deleteUser);

module.exports = router;