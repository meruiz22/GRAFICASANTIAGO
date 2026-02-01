const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    mensaje: { type: String, required: true },
    tipo: { type: String, default: 'info' }, // info, success, warning
    leido: { type: Boolean, default: false },
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);