const express = require('express');
const router = express.Router();

// Importamos el controlador con el nombre EXACTO de tu foto (ProductController)
const ProductController = require('../controllers/ProductController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// Definimos las rutas usando las funciones que SÍ existen en el controlador

// Ver todos los productos
router.route('/products').get(ProductController.getProducts);

// Ver un producto por ID
router.route('/product/:id').get(ProductController.getSingleProduct);

// Rutas de Admin (Crear, Actualizar, Borrar)
router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), ProductController.newProduct);

router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), ProductController.updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), ProductController.deleteProduct);

module.exports = router;