const OrderRepository = require('../repositories/order.repository');

class OrderController {
    
    // Crear nueva orden
    async newOrder(req, res, next) {
        try {
            const {
                orderItems,
                shippingInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentInfo
            } = req.body;

            const order = await OrderRepository.create({
                orderItems,
                shippingInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentInfo,
                paidAt: Date.now(),
                user: req.user._id // El ID viene del middleware de autenticación
            });

            res.status(201).json({
                success: true,
                order
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Ver una orden específica
    async getSingleOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ success: false, message: 'Orden no encontrada' });
            }
            res.status(200).json({ success: true, order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Ver mis órdenes (Usuario logueado)
    async myOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findByUser(req.user._id);
            res.status(200).json({ success: true, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: Ver todas las órdenes
    async allOrders(req, res, next) {
        try {
            const orders = await OrderRepository.findAll();
            let totalAmount = 0;
            orders.forEach(order => {
                totalAmount += order.totalPrice;
            });
            res.status(200).json({ success: true, totalAmount, orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: Actualizar estado de orden
    async updateOrder(req, res, next) {
        try {
            const order = await OrderRepository.findById(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });

            if (order.orderStatus === 'Delivered') {
                return res.status(400).json({ message: 'Esta orden ya fue entregada' });
            }

            order.orderStatus = req.body.status;
            if (req.body.status === 'Delivered') {
                order.deliveredAt = Date.now();
            }

            await order.save();
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Admin: Eliminar orden
    async deleteOrder(req, res, next) {
        try {
            const order = await OrderRepository.delete(req.params.id);
            if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

// Exportamos las funciones individuales para que coincidan con la ruta
const controller = new OrderController();
module.exports = {
    newOrder: controller.newOrder,
    getSingleOrder: controller.getSingleOrder,
    myOrders: controller.myOrders,
    allOrders: controller.allOrders,
    updateOrder: controller.updateOrder,
    deleteOrder: controller.deleteOrder
};