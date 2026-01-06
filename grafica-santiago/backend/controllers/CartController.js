const Cart = require('../models/cart_model');

class CartController {

    // 1. Agregar item al carrito
    async addItemToCart(req, res, next) {
        try {
            const { productId, name, price, image, quantity, stock } = req.body;
            // El usuario viene del middleware de autenticación
            const userId = req.user._id; 

            let cart = await Cart.findOne({ user: userId });

            if (cart) {
                // Si ya existe el carrito, buscamos si el producto ya está
                const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);

                if (itemIndex > -1) {
                    // Si existe, actualizamos la cantidad
                    let productItem = cart.cartItems[itemIndex];
                    productItem.quantity += quantity;
                    cart.cartItems[itemIndex] = productItem;
                } else {
                    // Si no existe, lo empujamos al array
                    cart.cartItems.push({ product: productId, name, price, image, quantity, stock });
                }
            } else {
                // Si no tiene carrito, creamos uno nuevo
                cart = await Cart.create({
                    user: userId,
                    cartItems: [{ product: productId, name, price, image, quantity, stock }]
                });
            }

            await cart.save();
            res.status(200).json({ success: true, cart });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 2. Obtener mi carrito (ESTA ES LA QUE TE FALTABA 'getCart')
    async getCart(req, res, next) {
        try {
            const cart = await Cart.findOne({ user: req.user._id });
            
            if (!cart) {
                return res.status(200).json({ success: true, cartItems: [] });
            }

            res.status(200).json({ success: true, cartItems: cart.cartItems, cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // 3. Eliminar item
    async removeCartItem(req, res, next) {
        try {
            const cart = await Cart.findOne({ user: req.user._id });

            if (!cart) {
                return res.status(404).json({ success: false, message: 'Carrito no encontrado' });
            }

            const newCartItems = cart.cartItems.filter(
                item => item.product.toString() !== req.params.id
            );

            cart.cartItems = newCartItems;
            await cart.save();

            res.status(200).json({ success: true, cart });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CartController();