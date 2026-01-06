// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Auth API Tests', () => {
  beforeAll(async () => {
    // Conectar a base de datos de prueba
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/grafica_test');
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Limpiar usuarios después de cada test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('token');
    });

    it('debe fallar con email duplicado', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      };

      // Primer registro
      await request(app).post('/api/auth/register').send(userData);

      // Segundo intento con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('email ya está registrado');
    });

    it('debe fallar con contraseña menor a 6 caracteres', async () => {
      const userData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: '12345',
        telefono: '0987654321'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app).post('/api/auth/register').send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      });
    });

    it('debe iniciar sesión exitosamente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'juan@example.com');
    });

    it('debe fallar con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Credenciales inválidas');
    });

    it('debe fallar con email no registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      // Registrar y obtener token
      const res = await request(app).post('/api/auth/register').send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      });
      token = res.body.data.token;
    });

    it('debe obtener el perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', 'juan@example.com');
    });

    it('debe fallar sin token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('debe fallar con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      });
      token = res.body.data.token;
    });

    it('debe actualizar el perfil del usuario', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Juan Carlos',
          apellido: 'Pérez García',
          telefono: '0999999999'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('Juan Carlos');
      expect(res.body.data.apellido).toBe('Pérez García');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        password: 'password123',
        telefono: '0987654321'
      });
      token = res.body.data.token;
    });

    it('debe cambiar la contraseña exitosamente', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verificar que puede iniciar sesión con la nueva contraseña
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'newpassword123'
        });

      expect(loginRes.status).toBe(200);
    });

    it('debe fallar con contraseña actual incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});