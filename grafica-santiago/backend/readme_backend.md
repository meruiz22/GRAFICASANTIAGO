# Backend Gráfica Santiago - Sistema E-Commerce

Sistema backend completo para la tienda en línea de Gráfica Santiago, implementado con Node.js, Express y MongoDB.

## 🏗️ Arquitectura y Patrones de Diseño

### Patrones Implementados:

1. **MVC (Model-View-Controller)**
   - **Models**: Definición de esquemas y modelos de datos (Mongoose)
   - **Controllers**: Lógica de manejo de peticiones HTTP
   - **Routes**: Definición de endpoints de la API

2. **Repository Pattern**
   - Abstracción de la capa de acceso a datos
   - Facilita testing y mantenibilidad
   - Desacopla la lógica de negocio de la persistencia

3. **Singleton Pattern**
   - Conexión única a la base de datos
   - Optimización de recursos

4. **Service Pattern**
   - Lógica de negocio reutilizable
   - Servicios de autenticación, email, pagos, etc.

## 📁 Estructura del Proyecto

```
backend/
├── config/
│   └── database.js          # Conexión DB (Singleton)
├── models/
│   ├── User.js              # Modelo de usuarios
│   ├── Product.js           # Modelo de productos
│   ├── Category.js          # Modelo de categorías
│   ├── Cart.js              # Modelo de carrito
│   ├── Order.js             # Modelo de pedidos
│   └── Notification.js      # Modelo de notificaciones
├── repositories/
│   ├── UserRepository.js    # Acceso a datos de usuarios
│   ├── ProductRepository.js # Acceso a datos de productos
│   └── OrderRepository.js   # Acceso a datos de pedidos
├── controllers/
│   ├── AuthController.js    # Controlador de autenticación
│   ├── ProductController.js # Controlador de productos
│   └── OrderController.js   # Controlador de pedidos
├── services/
│   ├── AuthService.js       # Lógica de autenticación
│   ├── EmailService.js      # Envío de emails
│   └── PaymentService.js    # Procesamiento de pagos
├── routes/
│   ├── auth.routes.js       # Rutas de autenticación
│   ├── product.routes.js    # Rutas de productos
│   ├── cart.routes.js       # Rutas de carrito
│   ├── order.routes.js      # Rutas de pedidos
│   ├── category.routes.js   # Rutas de categorías
│   ├── user.routes.js       # Rutas de usuarios
│   ├── notification.routes.js
│   └── report.routes.js     # Rutas de reportes
├── middleware/
│   ├── authMiddleware.js    # Autenticación JWT
│   └── validationMiddleware.js
├── .env.example             # Variables de entorno
├── package.json
└── server.js                # Punto de entrada
```

## 🚀 Instalación

### Requisitos Previos:
- Node.js >= 18.0.0
- MongoDB >= 6.0
- NPM o Yarn

### Pasos de Instalación:

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/grafica-santiago.git
cd grafica-santiago/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar MongoDB** (si es local)
```bash
mongod
```

5. **Ejecutar el servidor**

**Modo desarrollo:**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará corriendo en: `http://localhost:3000`

## 📋 Historias de Usuario Implementadas

### ✅ EPIC01 - Gestión de Cliente
- **HU001**: Registro de usuario con validaciones
- **HU002**: Inicio de sesión con JWT
- **HU003**: Recuperación de contraseña
- **HU004**: Edición de perfil
- **HU005**: Cerrar sesión

### ✅ EPIC02 - Productos
- **HU006**: Crear productos (Admin)
- **HU007**: Listar productos
- **HU008**: Editar productos (Admin)
- **HU009**: Eliminar productos (Admin)
- **HU010**: Búsqueda y filtros
- **HU011**: Detalle de producto
- **HU012**: Productos relacionados

### ✅ EPIC03 - Administración de Usuarios
- **HU013**: Listar usuarios (Admin)
- **HU014**: Cambiar tipo de cliente (Admin)
- **HU015**: Activar/desactivar cuentas (Admin)

### 🚧 En Desarrollo
- EPIC04: Gestión de Categorías
- EPIC05: Carrito de Compras
- EPIC06: Procesamiento de Pedidos
- EPIC07: Gestión de Envíos
- EPIC08: Métodos de Pago
- EPIC09: Panel de Administración
- EPIC10: Reportes y Estadísticas
- EPIC11: Notificaciones

## 🔐 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- Tokens con expiración configurable
- Opción "Recordarme" (30 días)
- Refresh tokens para sesiones largas

### Seguridad Implementada:
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de inputs
- ✅ Protección contra inyección SQL/NoSQL
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Headers de seguridad (Helmet)

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/register          # Registro
POST   /api/auth/login             # Login
POST   /api/auth/forgot-password   # Solicitar reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/verify-email/:token
GET    /api/auth/profile           # Perfil (Auth)
PUT    /api/auth/profile           # Editar perfil (Auth)
POST   /api/auth/change-password   # Cambiar password (Auth)
```

### Productos
```
GET    /api/products               # Listar productos
GET    /api/products/search        # Buscar productos
GET    /api/products/:id           # Detalle
GET    /api/products/:id/related   # Relacionados
GET    /api/products/category/:id  # Por categoría
POST   /api/products               # Crear (Admin)
PUT    /api/products/:id           # Editar (Admin)
DELETE /api/products/:id           # Eliminar (Admin)
```

### Carrito
```
GET    /api/cart                   # Ver carrito (Auth)
POST   /api/cart/items             # Agregar item (Auth)
PUT    /api/cart/items/:id         # Modificar cantidad (Auth)
DELETE /api/cart/items/:id         # Eliminar item (Auth)
POST   /api/cart/coupon            # Aplicar cupón (Auth)
DELETE /api/cart                   # Limpiar carrito (Auth)
```

### Pedidos
```
GET    /api/orders                 # Listar pedidos (Auth)
GET    /api/orders/:id             # Detalle pedido (Auth)
POST   /api/orders                 # Crear pedido (Auth)
PUT    /api/orders/:id/status      # Cambiar estado (Admin)
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage
```

## 📊 Base de Datos

### Modelos Principales:

#### User
- Información personal
- Credenciales (hasheadas)
- Tipo de cliente (minorista/mayorista/admin)
- Direcciones de envío
- Método de pago preferido

#### Product
- Información del producto
- Precios (minorista/mayorista)
- Stock y stock mínimo
- Categoría y subcategoría
- Estadísticas (vistas, ventas)

#### Order
- Número de pedido único
- Items del pedido
- Montos (subtotal, IVA, envío, total)
- Dirección de envío
- Estado del pedido
- Información de pago
- Historial de estados

#### Cart
- Usuario
- Items (producto, cantidad, precio)
- Cupón aplicado
- Métodos de cálculo de totales

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes:

```bash
# JWT
JWT_SECRET=cambiar_en_produccion
JWT_EXPIRATION=7d

# Base de Datos
MONGODB_URI=mongodb://localhost:27017/grafica_santiago

# Email (Gmail ejemplo)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=contraseña_de_aplicacion
```

### Pasarelas de Pago Soportadas:

1. **Stripe** (Internacional)
2. **PayPhone** (Ecuador)
3. **Transferencia Bancaria**
4. **Contra Entrega**
5. **Código QR**

## 🐛 Troubleshooting

### Error: Cannot connect to MongoDB
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod
```

### Error: JWT Secret not defined
```bash
# Asegúrate de tener el archivo .env configurado
cp .env.example .env
```

## 📚 Recursos Adicionales

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Mongoose](https://mongoosejs.com/)
- [JWT Best Practices](https://jwt.io/)

## 👥 Equipo de Desarrollo

- Antonella Parra
- Mario Morocho
- Martín Ruiz

## 📄 Licencia

ISC License - Gráfica Santiago © 2025