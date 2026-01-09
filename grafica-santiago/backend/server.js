const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const DatabaseConnection = require('./config/database');

// --- Importar Rutas ---
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reportRoutes = require('./routes/report.routes');
// const notificationRoutes = require('./routes/notification.routes'); // Descomentar cuando crees el archivo

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión Base de Datos
DatabaseConnection.getInstance().connect();

// --- Definir Rutas ---
app.use('/api/v1/auth', authRoutes);      // Login, Register
app.use('/api/v1', productRoutes);        // Productos (GET y Admin CRUD)
app.use('/api/reports', reportRoutes);    // Reportes Admin

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Gráfica Santiago API is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});