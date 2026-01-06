// repositories/UserRepository.js
const User = require('../models/user_model');

/**
 * Repository Pattern - Abstrae la lógica de acceso a datos
 */
class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id).select('+password');
  }

  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  async findAll(filters = {}) {
    return await User.find(filters);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByResetToken(token) {
    return await User.findOne({
      tokenResetPassword: token,
      tokenResetExpira: { $gt: Date.now() }
    });
  }

  async findByVerificationToken(token) {
    return await User.findOne({ tokenVerificacion: token });
  }

  async activateUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { activo: true } },
      { new: true }
    );
  }

  async deactivateUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { activo: false } },
      { new: true }
    );
  }

  async changeUserType(id, tipoCliente) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { tipoCliente } },
      { new: true }
    );
  }

  async addAddress(userId, address) {
    return await User.findByIdAndUpdate(
      userId,
      { $push: { direcciones: address } },
      { new: true }
    );
  }

  async getMostFrequentCustomers(limit = 20) {
    return await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'usuario',
          as: 'pedidos'
        }
      },
      {
        $addFields: {
          cantidadPedidos: { $size: '$pedidos' },
          montoTotal: { $sum: '$pedidos.montos.total' },
          ticketPromedio: {
            $cond: [
              { $gt: [{ $size: '$pedidos' }, 0] },
              { $divide: [{ $sum: '$pedidos.montos.total' }, { $size: '$pedidos' }] },
              0
            ]
          }
        }
      },
      {
        $sort: { cantidadPedidos: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          nombre: 1,
          apellido: 1,
          email: 1,
          cantidadPedidos: 1,
          montoTotal: 1,
          ticketPromedio: 1,
          ultimaCompra: { $max: '$pedidos.createdAt' }
        }
      }
    ]);
  }
}

module.exports = new UserRepository();