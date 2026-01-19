const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            nombre: { type: String, required: true },
            cantidad: { type: Number, required: true },
            imagen: { type: String, required: true },
            precio: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    shippingInfo: {
        direccion: { type: String, required: true },
        ciudad: { type: String, required: true },
        telefono: { type: String, required: true }
    },
    paymentInfo: {
        id: { type: String },
        status: { type: String }
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    orderStatus: {
        type: String,
        required: true,
        default: 'Procesando'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 🔥 MUEVE LAS LÍNEAS AQUÍ ABAJO (Antes del export)
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);