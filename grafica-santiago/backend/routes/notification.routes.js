const express = require('express');
const router = express.Router();
const Notification = require('../models/notification_model');
const { isAuthenticatedUser } = require('../middleware/auth'); // Asegúrate que la ruta al middleware sea correcta

// 1. Obtener mis notificaciones
// Al usar router.get('/me') y conectarlo en app.js con '/api/v1/notifications'
// La ruta final queda: /api/v1/notifications/me (Que es lo que busca el Frontend)
router.get('/me', isAuthenticatedUser, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
                                            .sort({ fecha: -1 })
                                            .limit(10);
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Marcar como leída
router.put('/read/:id', isAuthenticatedUser, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { leido: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;