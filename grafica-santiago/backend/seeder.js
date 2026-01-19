const mongoose = require('mongoose');
const User = require('./models/user_model');

// 👇 CONEXIÓN
const MONGO_URI = 'mongodb://127.0.0.1:27017/grafica_santiago';

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("🔌 Conectado.");

        const email = "admin@grafica.com";
        const password = "12345678"; 
        
        let user = await User.findOne({ email });

        // 🔥 CAMBIO IMPORTANTE: NO ENCRIPTAMOS AQUÍ
        // Le pasamos la contraseña "cruda" para que el Modelo la encripte
        
        if (user) {
            user.role = 'admin';
            user.password = password; // Texto plano
            await user.save(); // El modelo dispara el pre('save') y la encripta
            console.log("✅ Usuario actualizado a ADMIN (Pass re-encriptada).");
        } else {
            user = await User.create({
                nombre: "Super",
                apellido: "Admin",
                email: email,
                password: password, // Texto plano
                role: "admin",
                telefono: "0999999999",
                cedulaRuc: "1111111111"
            });
            console.log("✅ Nuevo usuario ADMIN creado.");
        }

        console.log("📧 Email: " + email);
        console.log("🔑 Pass:  " + password);

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

createAdmin();