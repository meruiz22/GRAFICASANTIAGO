const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
    apellido: { type: String, required: [true, 'El apellido es obligatorio'] },
    email: { 
        type: String, 
        required: [true, 'El email es obligatorio'], 
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria'], 
        minlength: 6, 
        select: false 
    },
    telefono: { type: String },
    // ESTO ES LO IMPORTANTE PARA EL PANEL ADMIN:
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    activo: { type: Boolean, default: true },
    direcciones: [{
        calle: String,
        ciudad: String,
        codigoPostal: String,
        esPrincipal: { type: Boolean, default: false }
    }],
    createdAt: { type: Date, default: Date.now }
});

// Encriptar contraseña
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparar contraseña
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);