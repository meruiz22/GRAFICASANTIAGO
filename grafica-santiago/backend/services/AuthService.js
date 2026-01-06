// services/AuthService.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Service Pattern - Contiene la lógica de negocio de autenticación
 */
class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'tu_secreto_super_seguro_cambialo';
  }

  /**
   * Genera un token JWT para el usuario
   */
  generateToken(userId, expiresIn = '7d') {
    return jwt.sign(
      { id: userId },
      this.jwtSecret,
      { expiresIn }
    );
  }

  /**
   * Verifica y decodifica un token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  /**
   * Genera un token aleatorio para verificación de email
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera un token aleatorio para reset de contraseña
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Valida el formato de email
   */
  validateEmail(email) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida la fortaleza de la contraseña
   */
  validatePassword(password) {
    if (password.length < 6) {
      return {
        valid: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      };
    }

    return {
      valid: true,
      message: 'Contraseña válida'
    };
  }

  /**
   * Extrae el token del header Authorization
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new AuthService();