const mongoose = require('mongoose');
const User = require('./models/user_model');
const MONGO_URI = 'mongodb://127.0.0.1:27017/grafica_santiago';

const createBodega = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("🔌 Conectado.");

        const email = "bodega@grafica.com";
        const password = "bodega123"; // Contraseña del bodeguero
        
        // Borramos si existe para crearlo limpio
        await User.findOneAndDelete({ email });

        await User.create({
            nombre: "Encargado",
            apellido: "Bodega",
            email: email,
            password: password, // El modelo la encriptará
            role: "bodega",     // 📦 ROL NUEVO
            telefono: "0991234567",
            cedulaRuc: "1100000000"
        });

        console.log("✅ Usuario BODEGA creado.");
        console.log("📧 Email: " + email);
        console.log("🔑 Pass:  " + password);

    } catch (error) { console.error(error); } 
    finally { await mongoose.disconnect(); }
};

createBodega();