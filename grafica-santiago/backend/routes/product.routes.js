const express = require('express');
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  addOrUpdateReview,
  getReviews,
  deleteReview
} = require('../controllers/ProductController');

const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth.middleware');

// ==========================================
// RUTAS PÚBLICAS
// ==========================================
router.get('/products', getProducts);
router.get('/products/:id', getSingleProduct);
router.get('/products/:id/reviews', getReviews);

// ==========================================
// RUTAS DE USUARIO (RESEÑAS)
// ==========================================
router.post('/products/:id/reviews', isAuthenticatedUser, addOrUpdateReview);
router.delete('/products/:id/reviews/:reviewId', isAuthenticatedUser, deleteReview);

// ==========================================
// RUTAS DE ADMIN Y BODEGA (GESTIÓN DE PRODUCTOS)
// ==========================================

// Crear nuevo producto (Admin y Bodega)
router.route('/admin/product/new').post(
    isAuthenticatedUser, 
    authorizeRoles('admin', 'bodega'), // 👈 AQUÍ AGREGAMOS BODEGA
    newProduct
);

// Editar y Eliminar producto (Admin y Bodega)
router.route('/admin/product/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin', 'bodega'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin', 'bodega'), deleteProduct);

module.exports = router;