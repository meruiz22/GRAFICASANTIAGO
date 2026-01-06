// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gráfica Santiago API',
      version: '1.0.0',
      description: 'API REST para el sistema de e-commerce de Gráfica Santiago',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@graficasantiago.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.graficasantiago.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de autenticación'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            nombre: { type: 'string', example: 'Juan' },
            apellido: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'juan@example.com' },
            telefono: { type: 'string', example: '0987654321' },
            tipoCliente: { 
              type: 'string', 
              enum: ['minorista', 'mayorista', 'administrador'],
              example: 'minorista'
            },
            activo: { type: 'boolean', example: true },
            emailVerificado: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', example: 'Cuaderno A4' },
            codigo: { type: 'string', example: 'CUAD001' },
            descripcion: { type: 'string', example: 'Cuaderno universitario 100 hojas' },
            tipo: { type: 'string', example: 'Cuaderno' },
            marca: { type: 'string', example: 'Norma' },
            categoria: { type: 'string' },
            precio: {
              type: 'object',
              properties: {
                minorista: { type: 'number', example: 2.50 },
                mayorista: { type: 'number', example: 2.00 }
              }
            },
            stock: {
              type: 'object',
              properties: {
                cantidad: { type: 'number', example: 100 },
                minimo: { type: 'number', example: 10 }
              }
            },
            activo: { type: 'boolean', example: true }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            numeroPedido: { type: 'string', example: 'GS250100001' },
            usuario: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  producto: { type: 'string' },
                  nombre: { type: 'string' },
                  cantidad: { type: 'number' },
                  precioUnitario: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            },
            montos: {
              type: 'object',
              properties: {
                subtotal: { type: 'number' },
                iva: { type: 'number' },
                descuento: { type: 'number' },
                envio: { type: 'number' },
                total: { type: 'number' }
              }
            },
            estado: {
              type: 'string',
              enum: ['pendiente_pago', 'pagado', 'procesando', 'enviado', 'entregado', 'cancelado']
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;