const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DatabaseConnection = require('./config/database');
// IMPORTANTE: Asegúrate que la ruta a tu modelo de usuario sea correcta
// Si tu archivo se llama user.routes.js, busca dónde está el modelo. 
// Normalmente es ./models/user.model o ./models/User
const User = require('./models/user_model'); 

dotenv.config();

const promoteUser = async () => {
    try {
        await DatabaseConnection.getInstance().connect();
        
const emailTarget = "admin@grafica.com";

        const user = await User.findOneAndUpdate(
            { email: emailTarget },
            { role: 'admin' }, // Le asignamos el rol de admin
            { new: true }
        );

        if (user) {
            console.log(`✅ ¡ÉXITO! El usuario ${user.nombre} ahora es ADMIN.`);
        } else {
            console.log("❌ No encontré ese correo. ¿Seguro que te registraste?");
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promoteUser();