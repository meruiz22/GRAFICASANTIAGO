const Product = require('../models/product_model');

class ProductController {
    // Obtener todos
    async getProducts(req, res) {
        try {
            const products = await Product.find();
            res.status(200).json({ success: true, products });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener uno
    async getSingleProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Crear (Admin)
    async newProduct(req, res) {
        try {
            // Aseguramos que precio sea objeto si viene simple
            // (El frontend ya lo manda bien, pero por seguridad)
            const product = await Product.create(req.body);
            res.status(201).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Actualizar (Admin)
    async updateProduct(req, res) {
        try {
            let product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

            product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Eliminar (Admin)
    async deleteProduct(req, res) {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
            res.status(200).json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProductController();