const mongoose = require('mongoose');
// Pon tu URI correcta
mongoose.connect('mongodb://127.0.0.1:27017/grafica_santiago')
  .then(async () => {
      await mongoose.connection.collection('products').deleteMany({});
      console.log("¡Todo borrado!");
      process.exit();
  });