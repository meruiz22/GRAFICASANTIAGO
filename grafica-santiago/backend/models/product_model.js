const mongoose = require('mongoose');



const productSchema = new mongoose.Schema({
  cod: { 
        type: String, 
        trim: true,
        default: '' 
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    precio: {
        minorista: { type: Number, required: true },
        mayorista: { type: Number, required: true }
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        default: 0
    },
    activo: {
        type: Boolean,
        default: true
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        // enum: ['Papelería', 'Tecnología', 'Libros', 'Oficina', 'Arte', 'Otros', 'Cuadernos', 'Papel', 'Escritura']
    },
    imagenes: [
        {
            url: { type: String }
        }
    ],
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

// 🔥 AQUÍ ES EL LUGAR CORRECTO (Después de crear el esquema, antes de exportar)
productSchema.index({ stock: -1 });

module.exports = mongoose.model('Product', productSchema);