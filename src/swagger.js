const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Todo API Documentation',
    version: '1.0.0',
    description: 'Dokumentasi interaktif Todo API - Production Stage 2',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key'
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register akun baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Budi' },
                  email: { type: 'string', example: 'budi@example.com' },
                  password: { type: 'string', example: 'rahasia1234567' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'User registered successfully' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'budi@example.com' },
                  password: { type: 'string', example: 'rahasia1234567' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Login Successful' } }
      }
    },
    '/api/categories': {
      post: {
        tags: ['Categories'],
        summary: 'Buat Category baru',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Pekerjaan' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Category created successfully' } }
      },
      get: {
        tags: ['Categories'],
        summary: 'Ambil semua Category',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Categories retrieved successfully' } }
      }
    },
    '/api/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Ambil Category berdasarkan ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category retrieved successfully' } }
      },
      put: {
        tags: ['Categories'],
        summary: 'Update Category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Pekerjaan Rumah' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Category updated successfully' } }
      },
      delete: {
        tags: ['Categories'],
        summary: 'Hapus Category',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Category deleted successfully' } }
      }
    },
    '/api/todos': {
      post: {
        tags: ['Todos'],
        summary: 'Buat Todo baru',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Belajar Swagger' },
                  description: { type: 'string', example: 'Tugas Stage 2' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Todo created successfully' } }
      },
      get: {
        tags: ['Todos'],
        summary: 'Ambil semua Todo & fitur Search',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 5 } },
          { name: 'search', in: 'query', schema: { type: 'string', example: 'belajar' } }
        ],
        responses: { 200: { description: 'Todos retrieved successfully' } }
      }
    },
    '/api/todos/{id}': {
      get: {
        tags: ['Todos'],
        summary: 'Ambil Todo berdasarkan ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Todo retrieved successfully' } }
      },
      put: {
        tags: ['Todos'],
        summary: 'Update data Todo',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Belajar Swagger Selesai' },
                  completed: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Todo updated successfully' } }
      },
      delete: {
        tags: ['Todos'],
        summary: 'Soft Delete Todo',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Todo deleted successfully' } }
      }
    },
    '/api/todos/{id}/restore': {
      put: {
        tags: ['Todos'],
        summary: 'Restore Todo yang di Soft Delete',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Todo restored successfully' } }
      }
    },
    '/api/todos/{id}/force': {
      delete: {
        tags: ['Todos'],
        summary: 'Hard Delete Todo (Permanen)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Todo permanently deleted from database' } }
      }
    },
    '/api/stats/summary': {
      get: {
        tags: ['Stats'],
        summary: 'Ambil kalkulasi Summary Stats',
        security: [{ ApiKeyAuth: [] }],
        responses: { 200: { description: 'Summary retrieved successfully' } }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;