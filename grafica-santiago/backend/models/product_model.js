const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'Nombre obligatorio'], 
        trim: true 
    },
    descripcion: { type: String },
    // AQUI CAMBIAMOS PARA SOPORTAR DOS PRECIOS
    precio: {
        minorista: { type: Number, required: true, default: 0 },
        mayorista: { type: Number, default: 0 }
    },
    stock: { type: Number, required: true, default: 0 },
    categoria: { type: String, required: true },
    imagenes: [{
        public_id: String,
        url: String
    }],
    activo: { type: Boolean, default: true },
    usuario: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Opcional por ahora para no romper scripts viejos
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);