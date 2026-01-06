const express = require('express');
const router = express.Router();

// IMPORTANTE: El nombre del archivo debe ser exacto (Mayúscula C)
const CartController = require('../controllers/CartController');
const { isAuthenticatedUser } = require('../middleware/auth.middleware');

// Rutas
// Aquí es donde te daba el error (Línea 12): Ahora 'CartController.getCart' SÍ existe.
router.route('/cart').get(isAuthenticatedUser, CartController.getCart);

router.route('/cart/add').post(isAuthenticatedUser, CartController.addItemToCart);

router.route('/cart/remove/:id').delete(isAuthenticatedUser, CartController.removeCartItem);

module.exports = router;