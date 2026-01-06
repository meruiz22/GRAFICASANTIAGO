const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio']
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6,
    select: false // Importante: Para que no devuelva la password en consultas normales
  },
  tipoCliente: {
    type: String,
    enum: ['cliente', 'admin', 'empleado'],
    default: 'cliente'
  },
  activo: {
    type: Boolean,
    default: true
  },
  direcciones: [{
    calle: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String,
    pais: String,
    esPrincipal: { type: Boolean, default: false }
  }],
  telefono: {
    type: String
  },
  // Tokens para recuperación y verificación
  tokenResetPassword: String,
  tokenResetExpira: Date,
  tokenVerificacion: String,
  verificado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Encriptar contraseña antes de guardar (Middleware de Mongoose)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar contraseñas (usado en Login)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);