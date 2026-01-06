// backend/services/EmailService.js
class EmailService {
  constructor() {
    console.log('⚠️ EmailService: Modo desarrollo (Simulado). No se enviarán correos reales.');
  }

  async sendEmail(to, subject, html) {
    console.log(`📨 [SIMULACIÓN] Enviando correo a: ${to}`);
    console.log(`   Asunto: ${subject}`);
    return { messageId: 'simulated-123' };
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail(user.email, 'Bienvenido', '<h1>Hola</h1>');
  }
}

module.exports = new EmailService();