const mongoose = require('mongoose');
const dotenv = require('dotenv');
const DatabaseConnection = require('./config/database');
const User = require('./models/user_model');

dotenv.config();

const run = async () => {
    await DatabaseConnection.getInstance().connect();
    await User.deleteOne({ email: "admin@grafica.com" });
    await User.create({
        nombre: "Super", apellido: "Admin", email: "admin@grafica.com",
        password: "123456", role: "admin" // Nota el cambio a 'role'
    });
    console.log("Admin Creado (Role: admin)");
    process.exit();
};
run();