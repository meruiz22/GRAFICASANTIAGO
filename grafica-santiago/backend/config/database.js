const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        this.mongoURI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/grafica_santiago';
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
            console.log('🚀  MONGODB CONNECTED SUCCESSFULLY');
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error.message);
            process.exit(1);
        }
    }
}

module.exports = DatabaseConnection;