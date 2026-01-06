// Importamos el repositorio con el nombre EXACTO de tu foto
const ProductRepository = require('../repositories/ProductRepository');

class ProductController {

    // Crear producto
    async newProduct(req, res) {
        try {
            // Asignamos el usuario logueado (si existe)
            if (req.user) req.body.usuario = req.user.id;
            
            const product = await ProductRepository.create(req.body);
            res.status(201).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener todos (Esta es la función que te faltaba)
    async getProducts(req, res) {
        try {
            const products = await ProductRepository.findAll();
            res.status(200).json({
                success: true,
                count: products.length,
                products
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener uno solo
    async getSingleProduct(req, res) {
        try {
            const product = await ProductRepository.findById(req.params.id);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
            
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Actualizar
    async updateProduct(req, res) {
        try {
            const product = await ProductRepository.update(req.params.id, req.body);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
            
            res.status(200).json({ success: true, product });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Eliminar
    async deleteProduct(req, res) {
        try {
            const product = await ProductRepository.delete(req.params.id);
            if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
            
            res.status(200).json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ProductController();