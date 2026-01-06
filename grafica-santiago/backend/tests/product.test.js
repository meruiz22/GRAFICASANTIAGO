// tests/product.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

describe('Product API Tests', () => {
  let adminToken;
  let userToken;
  let categoryId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/grafica_test');

    // Crear usuario administrador
    const adminRes = await request(app).post('/api/auth/register').send({
      nombre: 'Admin',
      apellido: 'Test',
      email: 'admin@test.com',
      password: 'admin123',
      telefono: '0999999999'
    });
    adminToken = adminRes.body.data.token;

    // Actualizar a administrador
    await User.findOneAndUpdate(
      { email: 'admin@test.com' },
      { tipoCliente: 'administrador' }
    );

    // Crear usuario normal
    const userRes = await request(app).post('/api/auth/register').send({
      nombre: 'User',
      apellido: 'Test',
      email: 'user@test.com',
      password: 'user123',
      telefono: '0999999998'
    });
    userToken = userRes.body.data.token;

    // Crear categoría
    const category = await Category.create({
      nombre: 'Papelería',
      descripcion: 'Artículos de papelería',
      nivel: 0
    });
    categoryId = category._id;
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  describe('POST /api/products', () => {
    it('debe crear un producto (Admin)', async () => {
      const productData = {
        nombre: 'Cuaderno A4',
        codigo: 'CUAD001',
        descripcion: 'Cuaderno universitario',
        tipo: 'Cuaderno',
        marca: 'Norma',
        categoria: categoryId,
        precio: {
          minorista: 2.50,
          mayorista: 2.00
        },
        stock: {
          cantidad: 100,
          minimo: 10
        }
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('nombre', 'Cuaderno A4');
      expect(res.body.data).toHaveProperty('codigo', 'CUAD001');
    });

    it('debe fallar si no es administrador', async () => {
      const productData = {
        nombre: 'Cuaderno A4',
        codigo: 'CUAD001',
        tipo: 'Cuaderno',
        categoria: categoryId,
        precio: { minorista: 2.50, mayorista: 2.00 },
        stock: { cantidad: 100 }
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Crear productos de prueba
      await Product.create([
        {
          nombre: 'Cuaderno A4',
          codigo: 'CUAD001',
          tipo: 'Cuaderno',
          categoria: categoryId,
          precio: { minorista: 2.50, mayorista: 2.00 },
          stock: { cantidad: 100 }
        },
        {
          nombre: 'Lápiz HB',
          codigo: 'LAP001',
          tipo: 'Lápiz',
          categoria: categoryId,
          precio: { minorista: 0.50, mayorista: 0.40 },
          stock: { cantidad: 500 }
        }
      ]);
    });

    it('debe listar todos los productos', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('debe filtrar productos por categoría', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ categoria: categoryId });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/products/search', () => {
    beforeEach(async () => {
      await Product.create([
        {
          nombre: 'Cuaderno Universitario',
          codigo: 'CUAD001',
          tipo: 'Cuaderno',
          marca: 'Norma',
          categoria: categoryId,
          precio: { minorista: 2.50, mayorista: 2.00 },
          stock: { cantidad: 100 }
        },
        {
          nombre: 'Lápiz HB',
          codigo: 'LAP001',
          tipo: 'Lápiz',
          marca: 'Faber Castell',
          categoria: categoryId,
          precio: { minorista: 0.50, mayorista: 0.40 },
          stock: { cantidad: 500 }
        }
      ]);
    });

    it('debe buscar productos por nombre', async () => {
      const res = await request(app)
        .get('/api/products/search')
        .query({ q: 'Cuaderno' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].nombre).toContain('Cuaderno');
    });

    it('debe buscar productos por marca', async () => {
      const res = await request(app)
        .get('/api/products/search')
        .query({ marca: 'Norma' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        nombre: 'Cuaderno A4',
        codigo: 'CUAD001',
        tipo: 'Cuaderno',
        categoria: categoryId,
        precio: { minorista: 2.50, mayorista: 2.00 },
        stock: { cantidad: 100 }
      });
      productId = product._id;
    });

    it('debe obtener un producto por ID', async () => {
      const res = await request(app).get(`/api/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('nombre', 'Cuaderno A4');
    });

    it('debe retornar 404 si el producto no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        nombre: 'Cuaderno A4',
        codigo: 'CUAD001',
        tipo: 'Cuaderno',
        categoria: categoryId,
        precio: { minorista: 2.50, mayorista: 2.00 },
        stock: { cantidad: 100 }
      });
      productId = product._id;
    });

    it('debe actualizar un producto (Admin)', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Cuaderno A4 Actualizado',
          precio: { minorista: 3.00, mayorista: 2.50 }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('Cuaderno A4 Actualizado');
    });

    it('debe fallar si no es administrador', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nombre: 'Nuevo nombre' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        nombre: 'Cuaderno A4',
        codigo: 'CUAD001',
        tipo: 'Cuaderno',
        categoria: categoryId,
        precio: { minorista: 2.50, mayorista: 2.00 },
        stock: { cantidad: 100 }
      });
      productId = product._id;
    });

    it('debe eliminar un producto (Admin)', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que se eliminó
      const product = await Product.findById(productId);
      expect(product).toBeNull();
    });

    it('debe fallar si no es administrador', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});