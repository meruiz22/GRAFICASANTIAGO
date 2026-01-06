// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['pedido', 'pago', 'envio', 'producto', 'recordatorio', 'sistema'],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  leida: {
    type: Boolean,
    default: false
  },
  activa: {
    type: Boolean,
    default: true
  },
  datos: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  recordatorio: {
    fecha: Date,
    descripcion: String,
    tema: String
  }
}, {
  timestamps: true
});

// Índices
notificationSchema.index({ usuario: 1, leida: 1, createdAt: -1 });
notificationSchema.index({ 'recordatorio.fecha': 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;