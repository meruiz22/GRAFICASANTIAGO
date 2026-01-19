const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        // 👇 ESTO ES LO IMPORTANTE: Usamos 127.0.0.1 fijo
        this.mongoURI = 'mongodb://127.0.0.1:27017/grafica_santiago';
    }

    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    async connect() {
        try {
            await mongoose.connect(this.mongoURI);
            console.log('🚀 SERVIDOR CONECTADO A MONGODB EN:', this.mongoURI);
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error.message);
            process.exit(1);
        }
    }
}

module.exports = DatabaseConnection;