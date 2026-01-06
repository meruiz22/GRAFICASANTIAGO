// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const DatabaseConnection = require('./config/database');
const swaggerSpec = require('./config/swagger');

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
// const reportRoutes = require('./routes/report.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection (Singleton Pattern)
DatabaseConnection.getInstance().connect();

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gráfica Santiago API'
}));

// Rutas con prefijo de versión (Standard API)
app.use('/api/v1/auth', authRoutes);     // Queda: /api/v1/login
app.use('/api/v1', productRoutes);  // Queda: /api/v1/products
app.use('/api/v1', cartRoutes);     // Queda: /api/v1/cart
app.use('/api/v1', orderRoutes);    // Queda: /api/v1/order/new
// app.use('/api/v1', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Gráfica Santiago API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});