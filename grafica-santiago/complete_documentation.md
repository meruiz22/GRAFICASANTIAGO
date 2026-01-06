# 📦 Gráfica Santiago - Sistema E-Commerce Completo

Sistema completo de e-commerce desarrollado con arquitectura moderna, patrones de diseño profesionales, y tecnologías de vanguardia.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Backend - API REST](#backend---api-rest)
6. [Frontend - React](#frontend---react)
7. [Testing](#testing)
8. [Documentación API](#documentación-api)
9. [Patrones de Diseño](#patrones-de-diseño)
10. [Funcionalidades Implementadas](#funcionalidades-implementadas)

---

## 🎯 Descripción General

**Gráfica Santiago** es un sistema de comercio electrónico completo para la venta de artículos de papelería y suministros de oficina. El sistema incluye:

- ✅ Gestión completa de usuarios (clientes, mayoristas, administradores)
- ✅ Catálogo de productos con categorías jerárquicas
- ✅ Carrito de compras con cálculo de IVA y descuentos
- ✅ Sistema de pedidos con múltiples métodos de pago
- ✅ Panel de administración con reportes y estadísticas
- ✅ Sistema de notificaciones y recordatorios
- ✅ Gestión de envíos y tracking

---

## 🏗️ Arquitectura del Sistema

### Arquitectura de 3 Capas

```
┌─────────────────────────────────────────┐
│          FRONTEND (React)               │
│  - Interfaz de Usuario                  │
│  - Context API para estado global       │
│  - Componentes reutilizables            │
└─────────────┬───────────────────────────┘
              │ HTTP/REST
              │
┌─────────────▼───────────────────────────┐
│         BACKEND (Node.js/Express)       │
│  ┌─────────────────────────────────┐    │
│  │   Capa de Presentación          │    │
│  │   - Routes                       │    │
│  │   - Middleware                   │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │   Capa de Lógica de Negocio     │    │
│  │   - Controllers                  │    │
│  │   - Services                     │    │
│  └──────────┬──────────────────────┘    │
│             │                            │
│  ┌──────────▼──────────────────────┐    │
│  │   Capa de Acceso a Datos        │    │
│  │   - Repositories                 │    │
│  │   - Models (Mongoose)            │    │
│  └──────────┬──────────────────────┘    │
└─────────────┼───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      BASE DE DATOS (MongoDB)            │
│  - Users, Products, Orders, etc.        │
└─────────────────────────────────────────┘
```

---

## 💻 Tecnologías Utilizadas

### Backend
- **Node.js** v18+ - Runtime de JavaScript
- **Express.js** 4.x - Framework web
- **MongoDB** 6.x - Base de datos NoSQL
- **Mongoose** 8.x - ODM para MongoDB
- **JWT** (jsonwebtoken) - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Nodemailer** - Envío de emails
- **Swagger** - Documentación de API

### Frontend
- **React** 18.x - Librería de UI
- **Lucide React** - Iconos
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool

### Testing
- **Jest** - Framework de testing
- **Supertest** - Testing de APIs

### DevOps
- **Git** - Control de versiones
- **Docker** (opcional) - Containerización

---

## 🚀 Instalación y Configuración

### Pre-requisitos

```bash
- Node.js >= 18.0.0
- MongoDB >= 6.0
- NPM o Yarn
- Git
```

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/grafica-santiago.git
cd grafica-santiago
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar MongoDB (si es local)
mongod

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

**Variables de Entorno Importantes:**

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/grafica_santiago
JWT_SECRET=tu_secreto_super_seguro
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🔧 Backend - API REST

### Estructura de Directorios

```
backend/
├── config/
│   ├── database.js          # Singleton - Conexión DB
│   └── swagger.js           # Configuración Swagger
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Cart.js
│   ├── Order.js
│   └── Notification.js
├── repositories/
│   ├── UserRepository.js
│   ├── ProductRepository.js
│   └── OrderRepository.js
├── controllers/
│   ├── AuthController.js
│   ├── ProductController.js
│   ├── CartController.js
│   ├── OrderController.js
│   ├── CategoryController.js
│   ├── UserController.js
│   ├── NotificationController.js
│   └── ReportController.js
├── services/
│   ├── AuthService.js
│   ├── EmailService.js
│   └── PaymentService.js
├── routes/
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── category.routes.js
│   ├── user.routes.js
│   ├── notification.routes.js
│   └── report.routes.js
├── middleware/
│   ├── authMiddleware.js
│   └── validationMiddleware.js
├── tests/
│   ├── auth.test.js
│   └── product.test.js
├── .env.example
├── package.json
├── jest.config.js
└── server.js
```

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Iniciar sesión
POST   /api/auth/forgot-password   # Recuperar contraseña
POST   /api/auth/reset-password    # Restablecer contraseña
GET    /api/auth/profile           # Obtener perfil (Auth)
PUT    /api/auth/profile           # Actualizar perfil (Auth)
POST   /api/auth/change-password   # Cambiar contraseña (Auth)
```

#### Productos
```
GET    /api/products               # Listar productos
GET    /api/products/search        # Buscar productos
GET    /api/products/:id           # Detalle producto
GET    /api/products/:id/related   # Productos relacionados
POST   /api/products               # Crear producto (Admin)
PUT    /api/products/:id           # Editar producto (Admin)
DELETE /api/products/:id           # Eliminar producto (Admin)
```

#### Carrito
```
GET    /api/cart                   # Ver carrito (Auth)
POST   /api/cart/items             # Agregar producto (Auth)
PUT    /api/cart/items/:id         # Actualizar cantidad (Auth)
DELETE /api/cart/items/:id         # Eliminar producto (Auth)
POST   /api/cart/coupon            # Aplicar cupón (Auth)
```

#### Pedidos
```
POST   /api/orders                 # Crear pedido (Auth)
GET    /api/orders/my-orders       # Mis pedidos (Auth)
GET    /api/orders/:id             # Detalle pedido (Auth)
GET    /api/orders                 # Listar todos (Admin)
PUT    /api/orders/:id/status      # Cambiar estado (Admin)
PUT    /api/orders/:id/shipping    # Actualizar envío (Admin)
```

#### Reportes
```
GET    /api/reports/dashboard      # Métricas dashboard (Admin)
GET    /api/reports/sales          # Reporte de ventas (Admin)
GET    /api/reports/best-sellers   # Productos más vendidos (Admin)
GET    /api/reports/low-stock      # Stock bajo (Admin)
GET    /api/reports/top-customers  # Mejores clientes (Admin)
```

---

## 🎨 Frontend - React

### Estructura de Componentes

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartItem.jsx
│   │   └── LoginForm.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── ProductsPage.jsx
│   │   ├── CartPage.jsx
│   │   └── CheckoutPage.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
└── package.json
```

### Características del Frontend

✅ **Autenticación Completa**
- Login y registro
- Recuperación de contraseña
- Gestión de sesión con Context API

✅ **Catálogo de Productos**
- Listado con paginación
- Búsqueda y filtros
- Vista detallada de productos

✅ **Carrito de Compras**
- Agregar/eliminar productos
- Actualizar cantidades
- Cálculo automático de totales

✅ **Sistema de Pedidos**
- Proceso de checkout
- Selección de método de pago
- Historial de pedidos

✅ **Panel de Administración** (próximamente)
- Dashboard con métricas
- Gestión de productos
- Gestión de pedidos

---

## 🧪 Testing

### Ejecutar Tests

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm test -- --watch
```

### Cobertura de Tests

- ✅ Autenticación (registro, login, perfil)
- ✅ Productos (CRUD completo)
- ✅ Carrito de compras
- ✅ Pedidos
- ✅ Middleware de autenticación

### Ejemplo de Test

```javascript
describe('POST /api/auth/login', () => {
  it('debe iniciar sesión exitosamente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });
});
```

---

## 📚 Documentación API

### Swagger UI

La documentación completa de la API está disponible en Swagger:

```
http://localhost:3000/api-docs
```

### Características de la Documentación

- 📖 Endpoints completos con ejemplos
- 🔐 Autenticación JWT integrada
- 🎯 Schemas de datos
- ✅ Respuestas de éxito y error
- 🧪 Interfaz interactiva para probar endpoints

### Autenticación en Swagger

1. Obtener token: `POST /api/auth/login`
2. Clic en "Authorize" (🔒)
3. Ingresar: `Bearer {tu_token}`
4. Probar endpoints protegidos

---

## 🎯 Patrones de Diseño Implementados

### 1. **Singleton Pattern**
**Ubicación:** `config/database.js`

Asegura una única instancia de conexión a la base de datos.

```javascript
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
    this.connection = null;
    DatabaseConnection.instance = this;
  }

  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
```

### 2. **Repository Pattern**
**Ubicación:** `repositories/*`

Abstrae la lógica de acceso a datos, facilitando testing y mantenibilidad.

```javascript
class UserRepository {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }
}
```

### 3. **MVC (Model-View-Controller)**
**Ubicación:** Todo el backend

Separación clara de responsabilidades:
- **Model:** Mongoose schemas (`models/*`)
- **View:** Respuestas JSON
- **Controller:** Lógica de manejo de requests (`controllers/*`)

### 4. **Service Pattern**
**Ubicación:** `services/*`

Encapsula lógica de negocio reutilizable:

```javascript
class AuthService {
  generateToken(userId, expiresIn = '7d') {
    return jwt.sign({ id: userId }, this.jwtSecret, { expiresIn });
  }

  verifyToken(token) {
    return jwt.verify(token, this.jwtSecret);
  }
}
```

### 5. **Middleware Pattern**
**Ubicación:** `middleware/*`

Procesamiento de requests antes de llegar a controllers:

```javascript
const authenticate = async (req, res, next) => {
  const token = extractToken(req.headers.authorization);
  if (!token) return res.status(401).json({ message: 'No autorizado' });
  
  const decoded = verifyToken(token);
  req.user = decoded;
  next();
};
```

---

## ✨ Funcionalidades Implementadas

### ✅ EPIC01 - Gestión de Cliente
- [x] HU001: Registro con validaciones
- [x] HU002: Login con JWT
- [x] HU003: Recuperación de contraseña
- [x] HU004: Edición de perfil
- [x] HU005: Cerrar sesión

### ✅ EPIC02 - Productos
- [x] HU006: Crear productos (Admin)
- [x] HU007: Listar productos
- [x] HU008: Editar productos (Admin)
- [x] HU009: Eliminar productos (Admin)
- [x] HU010: Búsqueda con filtros
- [x] HU011: Detalle de producto
- [x] HU012: Productos relacionados

### ✅ EPIC03 - Administración de Usuarios
- [x] HU013: Listar usuarios (Admin)
- [x] HU014: Cambiar tipo de cliente (Admin)
- [x] HU015: Activar/desactivar cuentas (Admin)

### ✅ EPIC04 - Gestión de Categorías
- [x] HU017: Crear categorías principales
- [x] HU018: Crear subcategorías
- [x] Árbol jerárquico de categorías

### ✅ EPIC05 - Carrito de Compras
- [x] HU019: Agregar productos al carrito
- [x] HU020: Modificar cantidades
- [x] HU021: Eliminar productos
- [x] HU022: Cálculo en tiempo real (subtotal, IVA, total)
- [x] HU024: Aplicar cupones de descuento

### ✅ EPIC06 - Procesamiento de Pedidos
- [x] HU025-HU029: Crear pedido completo
- [x] HU030: Visualizar pedidos
- [x] Historial de estados
- [x] Generación automática de número de pedido

### ✅ EPIC07 - Gestión de Envíos
- [x] HU031: Configurar zonas de envío
- [x] HU032: Cálculo de costo de envío
- [x] HU033: Agregar número de guía
- [x] HU034: Rastreo de pedidos

### ✅ EPIC08 - Métodos de Pago
- [x] HU035: Transferencia bancaria
- [x] HU036: Contra entrega
- [x] HU037: Tarjeta de crédito/débito (Stripe)
- [x] HU038: Pago con código QR
- [x] HU039: Confirmación de pagos (Admin)

### ✅ EPIC09 - Panel de Administración
- [x] HU041: Métricas clave (dashboard)
- [x] HU038: Listar pedidos
- [x] HU040: Detalle de pedido
- [x] HU041: Cambiar estado de pedidos
- [x] HU042: Notas internas

### ✅ EPIC10 - Reportes y Estadísticas
- [x] HU044: Reporte de ventas por período
- [x] HU045: Productos más vendidos
- [x] HU046: Productos con stock bajo
- [x] HU048: Clientes más frecuentes
- [x] HU049: Estadísticas de métodos de pago

### ✅ EPIC11 - Notificaciones
- [x] HU050: Crear recordatorios
- [x] HU051: Ver notificaciones
- [x] HU054: Eliminar notificaciones
- [x] HU056: Editar recordatorios

---

## 📊 Base de Datos

### Colecciones Principales

1. **users** - Usuarios del sistema
2. **products** - Catálogo de productos
3. **categories** - Categorías jerárquicas
4. **carts** - Carritos de compra
5. **orders** - Pedidos realizados
6. **notifications** - Sistema de notificaciones

### Relaciones

```
User (1) ─── (1) Cart
User (1) ─── (N) Orders
Product (N) ─── (1) Category
Order (N) ─── (N) Products
```

---

## 🔒 Seguridad

### Implementaciones de Seguridad

✅ **Autenticación JWT**
- Tokens con expiración configurable
- Refresh tokens
- Invalidación de tokens

✅ **Protección de Contraseñas**
- Bcrypt con salt rounds
- Validación de fortaleza
- No almacenar en texto plano

✅ **Validación de Inputs**
- Express-validator
- Sanitización de datos
- Prevención de inyecciones

✅ **CORS Configurado**
- Whitelist de dominios
- Headers seguros

✅ **Rate Limiting**
- Límite de requests por IP
- Protección contra fuerza bruta

---

## 📈 Métricas y Rendimiento

### Optimizaciones Implementadas

- ✅ Índices en MongoDB para búsquedas rápidas
- ✅ Paginación en listados
- ✅ Agregaciones optimizadas para reportes
- ✅ Lazy loading de imágenes
- ✅ Caché de datos frecuentes

---

## 🚀 Despliegue

### Opción 1: Heroku (Backend)

```bash
# Instalar Heroku CLI
heroku login

# Crear app
heroku create grafica-santiago-api

# Configurar variables
heroku config:set JWT_SECRET=tu_secreto
heroku config:set MONGODB_URI=tu_mongodb_uri

# Desplegar
git push heroku main
```

### Opción 2: Vercel (Frontend)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd frontend
vercel --prod
```

### Opción 3: Docker

```dockerfile
# Dockerfile backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Soporte y Contacto

**Equipo de Desarrollo:**
- Antonella Parra
- Mario Morocho
- Martín Ruiz

**Repositorio:** [GitHub](https://github.com/tu-usuario/grafica-santiago)

---

## 📄 Licencia

ISC License © 2025 Gráfica Santiago

---

## 🎉 ¡Felicidades!

Has completado la instalación y configuración de **Gráfica Santiago**. El sistema está listo para su uso en desarrollo o producción.

Para cualquier duda, consulta la documentación o contacta al equipo de desarrollo.