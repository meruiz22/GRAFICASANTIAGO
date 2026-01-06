// repositories/OrderRepository.js
const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    const order = new Order(orderData);
    return await order.save();
  }

  async findById(id) {
    return await Order.findById(id)
      .populate('usuario', 'nombre apellido email telefono')
      .populate('items.producto', 'nombre codigo imagenes');
  }

  async findByOrderNumber(numeroPedido) {
    return await Order.findOne({ numeroPedido })
      .populate('usuario', 'nombre apellido email telefono')
      .populate('items.producto', 'nombre codigo imagenes');
  }

  async findByUser(userId, filters = {}) {
    return await Order.find({ usuario: userId, ...filters })
      .populate('items.producto', 'nombre codigo imagenes')
      .sort('-createdAt');
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 20, sort = '-createdAt' } = options;
    const skip = (page - 1) * limit;

    const orders = await Order.find(filters)
      .populate('usuario', 'nombre apellido email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filters);

    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('usuario items.producto');
  }

  async updateStatus(id, nuevoEstado, comentario = '', usuario = null) {
    const order = await Order.findById(id);
    if (!order) return null;
    
    return await order.agregarEstado(nuevoEstado, comentario, usuario);
  }

  async addInternalNote(orderId, nota) {
    return await Order.findByIdAndUpdate(
      orderId,
      { $set: { notasInternas: nota } },
      { new: true }
    );
  }

  async updatePaymentStatus(orderId, estadoPago, detalles = {}) {
    return await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          'pago.estado': estadoPago,
          'pago.fechaPago': estadoPago === 'pagado' ? new Date() : undefined,
          'pago.detalles': detalles
        }
      },
      { new: true }
    );
  }

  async updateShipping(orderId, shippingData) {
    return await Order.findByIdAndUpdate(
      orderId,
      { $set: { envio: shippingData } },
      { new: true }
    );
  }

  async getSalesByPeriod(fechaInicio, fechaFin) {
    return await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: fechaInicio, $lte: fechaFin },
          estado: { $in: ['pagado', 'procesando', 'enviado', 'entregado'] }
        }
      },
      {
        $group: {
          _id: null,
          ventasTotales: { $sum: '$montos.total' },
          cantidadPedidos: { $sum: 1 },
          promedioTicket: { $avg: '$montos.total' }
        }
      }
    ]);
  }

  async getPaymentMethodStats() {
    return await Order.aggregate([
      {
        $match: {
          'pago.estado': 'pagado'
        }
      },
      {
        $group: {
          _id: '$pago.metodo',
          cantidad: { $sum: 1 },
          montoTotal: { $sum: '$montos.total' }
        }
      },
      {
        $addFields: {
          metodo: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]);
  }

  async getDashboardMetrics() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return await Order.aggregate([
      {
        $facet: {
          ventasHoy: [
            {
              $match: {
                createdAt: { $gte: hoy },
                estado: { $in: ['pagado', 'procesando', 'enviado', 'entregado'] }
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$montos.total' },
                cantidad: { $sum: 1 }
              }
            }
          ],
          pedidosPendientes: [
            {
              $match: {
                estado: { $in: ['pendiente_pago', 'pagado', 'procesando'] }
              }
            },
            {
              $count: 'total'
            }
          ]
        }
      }
    ]);
  }
}

module.exports = new OrderRepository();