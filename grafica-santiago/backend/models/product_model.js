const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del producto'],
    trim: true,
    maxLength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'Por favor ingresa el precio del producto'],
    maxLength: [9, 'El precio no puede exceder los 9 dígitos'],
    default: 0.0
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor ingresa la descripción del producto'],
  },
  calificacion: {
    type: Number,
    default: 0
  },
  imagenes: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  categoria: {
    type: String,
    required: [true, 'Por favor selecciona la categoría del producto'],
    enum: {
      values: [
        'Electronica',
        'Camaras',
        'Laptops',
        'Accesorios',
        'Audifonos',
        'Comida',
        'Libros',
        'Ropa/Zapatos',
        'Belleza/Salud',
        'Deportes',
        'Hogar',
        'Otros'
      ],
      message: 'Por favor selecciona la categoría correcta'
    }
  },
  vendedor: {
    type: String,
    required: [true, 'Por favor ingresa el vendedor del producto']
  },
  stock: {
    type: Number,
    required: [true, 'Por favor ingresa el stock del producto'],
    maxLength: [5, 'El stock no puede exceder los 5 dígitos'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);