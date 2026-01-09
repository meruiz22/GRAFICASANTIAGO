const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Públicas
router.route('/products').get(ProductController.getProducts);
router.route('/products/:id').get(ProductController.getSingleProduct);

// Admin (Protegidas)
router.route('/products').post(isAuthenticatedUser, authorizeRoles('admin'), ProductController.newProduct);
router.route('/products/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), ProductController.updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), ProductController.deleteProduct);

module.exports = router;