const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        // Usa la variable de entorno o una local por defecto
        this.mongoURI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/grafica_santiago';
    }

    // Este es el método que tu server.js estaba buscando desesperadamente
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    async connect() {
        try {
            // Configuración recomendada para Mongoose 6+
            await mongoose.connect(this.mongoURI);
            
            console.log('====================================');
            console.log('🚀  MONGODB CONNECTED SUCCESSFULLY  🚀');
            console.log('====================================');
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error.message);
            process.exit(1); // Detener la app si no hay base de datos
        }
    }
}

module.exports = DatabaseConnection;