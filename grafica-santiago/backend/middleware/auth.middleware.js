const jwt = require('jsonwebtoken');
const User = require('../models/user_model'); 

// 1. Exportar la función isAuthenticatedUser
exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const { token } = req.cookies; // Ojo: Asegúrate de tener cookie-parser instalado, si no usa headers
        
        // Si no hay token en cookies, intentamos buscar en Header Authorization
        let tokenFinal = token;
        if (!tokenFinal && req.headers.authorization) {
            tokenFinal = req.headers.authorization.split(' ')[1];
        }

        if (!tokenFinal) {
            return res.status(401).json({ message: 'Por favor inicia sesión para acceder' });
        }

        const decoded = jwt.verify(tokenFinal, process.env.JWT_SECRET || 'clave_super_secreta_cambiar_en_produccion');
        req.user = await User.findById(decoded.id);
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

// 2. Exportar la función authorizeRoles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Usuario no autenticado' });
        }
        if (!roles.includes(req.user.tipoCliente)) {
            return res.status(403).json({ 
                message: `El rol (${req.user.tipoCliente}) no tiene permiso para esta acción` 
            });
        }
        next();
    };
};