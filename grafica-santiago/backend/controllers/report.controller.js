// controllers/ReportController.js
const OrderRepository = require('../repositories/order.repository');
const ProductRepository = require('../repositories/ProductRepository');
const UserRepository = require('../repositories/UserRepository');

class ReportController {
  // HU044: Reporte de ventas por período
  async getSalesReport(req, res, next) {
    try {
      const { fechaInicio, fechaFin, periodo = 'hoy' } = req.query;

      let startDate, endDate;

      if (fechaInicio && fechaFin) {
        startDate = new Date(fechaInicio);
        endDate = new Date(fechaFin);
      } else {
        // Calcular fechas según período
        endDate = new Date();
        startDate = new Date();

        switch (periodo) {
          case 'hoy':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'semana':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'mes':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'año':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        }
      }

      const ventas = await OrderRepository.getSalesByPeriod(startDate, endDate);

      res.json({
        success: true,
        data: {
          periodo: { fechaInicio: startDate, fechaFin: endDate },
          ventas: ventas[0] || {
            ventasTotales: 0,
            cantidadPedidos: 0,
            promedioTicket: 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // HU045: Productos más vendidos
  async getBestSellers(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const products = await ProductRepository.getBestSellers(parseInt(limit));

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  // HU046: Productos con stock bajo
  async getLowStockProducts(req, res, next) {
    try {
      const products = await ProductRepository.getLowStockProducts();

      res.json({
        success: true,
        data: products,
        count: products.length
      });
    } catch (error) {
      next(error);
    }
  }

  // HU048: Clientes más frecuentes
  async getTopCustomers(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const customers = await UserRepository.getMostFrequentCustomers(parseInt(limit));

      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      next(error);
    }
  }

  // HU049: Estadísticas de métodos de pago
  async getPaymentMethodStats(req, res, next) {
    try {
      const stats = await OrderRepository.getPaymentMethodStats();

      // Calcular porcentajes
      const total = stats.reduce((sum, item) => sum + item.cantidad, 0);
      const statsWithPercentage = stats.map(item => ({
        ...item,
        porcentaje: total > 0 ? ((item.cantidad / total) * 100).toFixed(2) : 0
      }));

      res.json({
        success: true,
        data: statsWithPercentage
      });
    } catch (error) {
      next(error);
    }
  }

  // HU041: Métricas del dashboard
  async getDashboardMetrics(req, res, next) {
    try {
      const metrics = await OrderRepository.getDashboardMetrics();
      const lowStockProducts = await ProductRepository.getLowStockProducts();

      const ventasHoy = metrics[0].ventasHoy[0] || { total: 0, cantidad: 0 };
      const pedidosPendientes = metrics[0].pedidosPendientes[0]?.total || 0;

      res.json({
        success: true,
        data: {
          ventasHoy: {
            monto: ventasHoy.total || 0,
            cantidad: ventasHoy.cantidad || 0
          },
          pedidosPendientes,
          productosStockBajo: lowStockProducts.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // HU047: Exportar reporte (simplificado - retorna JSON para descargar)
  async exportReport(req, res, next) {
    try {
      const { tipo, formato = 'json' } = req.query;

      let data;

      switch (tipo) {
        case 'ventas':
          const endDate = new Date();
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          const ventas = await OrderRepository.getSalesByPeriod(startDate, endDate);
          data = ventas;
          break;

        case 'productos':
          const products = await ProductRepository.getBestSellers(50);
          data = products;
          break;

        case 'clientes':
          const customers = await UserRepository.getMostFrequentCustomers(50);
          data = customers;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Tipo de reporte inválido'
          });
      }

      // En producción, aquí se generaría un archivo Excel o PDF
      // Por ahora retornamos JSON
      res.json({
        success: true,
        data,
        message: `Reporte de ${tipo} generado`,
        formato
      });
    } catch (error) {
      next(error);
    }
  }

  // Reporte de ventas por categoría
  async getSalesByCategory(req, res, next) {
    try {
      const Order = require('../models/Order');
      
      const stats = await Order.aggregate([
        {
          $match: {
            estado: { $in: ['pagado', 'procesando', 'enviado', 'entregado'] }
          }
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.producto',
            foreignField: '_id',
            as: 'producto'
          }
        },
        { $unwind: '$producto' },
        {
          $lookup: {
            from: 'categories',
            localField: 'producto.categoria',
            foreignField: '_id',
            as: 'categoria'
          }
        },
        { $unwind: '$categoria' },
        {
          $group: {
            _id: '$categoria.nombre',
            totalVentas: { $sum: '$items.subtotal' },
            cantidadProductos: { $sum: '$items.cantidad' }
          }
        },
        {
          $sort: { totalVentas: -1 }
        }
      ]);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();