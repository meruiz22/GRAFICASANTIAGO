const Order = require('../models/order.model');
const Product = require('../models/product_model');
const User = require('../models/user_model');

// HU044: Reporte de Ventas
exports.getSalesReport = async (req, res) => {
    try {
        const { periodo } = req.query;
        let fechaInicio = new Date();

        // Lógica de filtrado
        if (periodo === 'semana') fechaInicio.setDate(fechaInicio.getDate() - 7);
        if (periodo === 'mes') fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        if (periodo === 'año') fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        if (periodo === 'hoy') fechaInicio.setHours(0,0,0,0);

        const ventas = await Order.aggregate([
            { $match: { createdAt: { $gte: fechaInicio } } },
            { 
                $group: { 
                    _id: null, 
                    ventasTotales: { $sum: "$totalPrice" }, // Usamos totalPrice del modelo Order
                    cantidadPedidos: { $sum: 1 },
                    promedioTicket: { $avg: "$totalPrice" }
                } 
            }
        ]);

        res.json({ 
            success: true, 
            data: { ventas: ventas[0] || { ventasTotales: 0, cantidadPedidos: 0, promedioTicket: 0 } } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// HU045: Productos más vendidos (Simulado por stock por ahora, idealmente usar orders)
exports.getBestSellers = async (req, res) => {
    try {
        const products = await Product.find().sort({ stock: -1 }).limit(5);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// HU046: Stock Bajo
exports.getLowStock = async (req, res) => {
    try {
        const products = await Product.find({ stock: { $lte: 10 } });
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// HU048: Top Clientes
exports.getTopCustomers = async (req, res) => {
    try {
        // En producción haríamos un aggregate con Orders, por ahora devolvemos usuarios
        const customers = await User.find({ role: 'user' }).limit(5);
        res.json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// HU049: Métodos de Pago (Dummy Data por ahora)
exports.getPaymentMethods = async (req, res) => {
    res.json({ 
        success: true, 
        data: [
            { metodo: 'transferencia', porcentaje: 40, cantidad: 20, montoTotal: 1500 },
            { metodo: 'efectivo', porcentaje: 60, cantidad: 30, montoTotal: 2500 }
        ] 
    });
};