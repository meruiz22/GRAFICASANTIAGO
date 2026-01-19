const Product = require('../models/product_model');
const Order = require('../models/order.model');
const User = require('../models/user_model');

/**
 * Reporte resumen para dashboard admin
 * Devuelve:
 * - total usuarios
 * - total productos
 * - total pedidos
 * - total ventas (si existe totalPrice en Order)
 * - pedidos por estado (si existe orderStatus en Order)
 * - top 5 productos con más stock
 */
exports.getSummary = async (req, res) => {
  try {
    // LANZAMOS TODAS LAS PETICIONES AL MISMO TIEMPO 🚀
    const [
        usersCount, 
        productsCount, 
        ordersCount, 
        totalSalesAgg, 
        ordersByStatusAgg, 
        topStockProducts
    ] = await Promise.all([
        // 1. Contar Usuarios
        User.countDocuments(),
        
        // 2. Contar Productos
        Product.countDocuments(),
        
        // 3. Contar Pedidos
        Order.countDocuments(),

        // 4. Calcular Ventas Totales (Suma rápida)
        Order.aggregate([
            { $group: { _id: null, total: { $sum: { $ifNull: ['$totalPrice', 0] } } } }
        ]),

        // 5. Agrupar Pedidos por Estado
        Order.aggregate([
            { $group: { _id: { $ifNull: ['$orderStatus', 'Sin Estado'] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]),

        // 6. Top 5 Productos con más stock (Consulta ligera)
        Product.find()
            .sort({ stock: -1 })
            .limit(5)
            .select('nombre stock categoria precio')
            .lean() // .lean() hace que sea JSON puro (más rápido que Mongoose Documents)
    ]);

    // Procesamos resultados
    const totalSales = totalSalesAgg[0]?.total || 0;

    return res.json({
      success: true,
      summary: {
        usersCount,
        productsCount,
        ordersCount,
        totalSales,
        ordersByStatus: ordersByStatusAgg,
        topStockProducts
      }
    });

  } catch (error) {
    console.error('REPORT SUMMARY ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar el resumen de reportes.'
    });
  }
};
