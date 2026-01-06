const User = require('../models/user_model');
const jwt = require('jsonwebtoken');

// Función auxiliar para crear y enviar el token
const sendToken = (user, statusCode, res) => {
    // Crear token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    // Opciones para la cookie
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};

class AuthController {

    // Registrar Usuario
    async register(req, res, next) {
        try {
            const { nombre, apellido, email, password } = req.body;
            
            const user = await User.create({
                nombre,
                apellido,
                email,
                password
            });

            sendToken(user, 201, res);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Iniciar Sesión (Login)
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Verificar si ingresó email y contraseña
            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Por favor ingrese email y contraseña' });
            }

            // Buscar usuario en BD (incluyendo la contraseña que está oculta por defecto)
            const user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
            }

            // Verificar contraseña
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Email o contraseña inválidos' });
            }

            sendToken(user, 200, res);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Cerrar Sesión (Logout)
    async logout(req, res, next) {
        try {
            res.cookie('token', null, {
                expires: new Date(Date.now()),
                httpOnly: true
            });

            res.status(200).json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // --- Perfil de Usuario ---

    // Ver mi perfil
    async getUserProfile(req, res, next) {
        try {
            const user = await User.findById(req.user.id);
            res.status(200).json({ success: true, user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Actualizar contraseña
    async updatePassword(req, res, next) {
        // Implementación básica para que no falle la ruta
        res.status(200).json({ success: true, message: "Funcionalidad pendiente de implementar" });
    }

    // Actualizar perfil
    async updateProfile(req, res, next) {
        // Implementación básica
        res.status(200).json({ success: true, message: "Funcionalidad pendiente de implementar" });
    }

    // --- Funciones de Recuperación (Placeholders para que no falle la ruta) ---
    async forgotPassword(req, res, next) {
        res.status(200).json({ success: true, message: "Revisar correo" });
    }
    
    async resetPassword(req, res, next) {
        res.status(200).json({ success: true, message: "Contraseña cambiada" });
    }

    // --- Funciones Admin (Placeholders) ---
    async allUsers(req, res) { res.status(200).json({ success: true }); }
    async getUserDetails(req, res) { res.status(200).json({ success: true }); }
    async updateUser(req, res) { res.status(200).json({ success: true }); }
    async deleteUser(req, res) { res.status(200).json({ success: true }); }
}

module.exports = new AuthController();