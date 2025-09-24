import { z } from 'zod'
import {
  extendZodWithOpenApi,
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const TopicIdParam = z.object({
  id: z.uuid().openapi({ example: '8f85a3dd-d2ea-463f-8a0f-b60577a670bd' }),
})

export const CreateTopicSchema = z
  .object({
    name: z.string().min(1).openapi({ example: 'Root' }),
    content: z.string().min(1).openapi({ example: 'Content' }),
    parentTopicId: z.uuid().nullable().optional().openapi({ example: null }),
  })
  .openapi('CreateTopicInput')

export const UpdateTopicSchema = z
  .object({
    name: z.string().min(1).optional().openapi({ example: 'New name' }),
    content: z.string().min(1).optional().openapi({ example: 'New content' }),
    parentTopicId: z.uuid().nullable().optional().openapi({ example: null }),
  })
  .openapi('UpdateTopicInput')

export const VersionQuery = z
  .object({ version: z.coerce.number().optional().openapi({ example: 2 }) })
  .openapi('VersionQuery')

export const ShortestPathQuery = z
  .object({
    from: z.uuid().openapi({ example: 'aecaf129-68f6-4a53-902f-5581581c8a5c' }),
    to: z.uuid().openapi({ example: '75e5864a-d342-40d1-8bd8-60528b131ff7' }),
  })
  .openapi('ShortestPathQuery')

export const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description:
    'Send your token using the Authorization header with the Bearer scheme. Example: Authorization: Bearer eyJhbGciOi...',
})

registry.registerPath({
  method: 'post',
  path: '/topics',
  tags: ['Topics'],
  summary: 'Create topic',
  request: { body: { content: { 'application/json': { schema: CreateTopicSchema } } } },
  security: [{ BearerAuth: [] }],
  responses: {
    201: { description: 'Created' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

registry.registerPath({
  method: 'put',
  path: '/topics/{id}',
  tags: ['Topics'],
  summary: 'Update topic',
  request: {
    params: TopicIdParam,
    body: { content: { 'application/json': { schema: UpdateTopicSchema } } },
  },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/topics/{id}',
  tags: ['Topics'],
  summary: 'Delete topic',
  request: { params: TopicIdParam },
  security: [{ BearerAuth: [] }],
  responses: {
    204: { description: 'No content' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/topics/{id}',
  tags: ['Topics'],
  summary: 'Get topic (latest or specific version)',
  request: { params: TopicIdParam, query: VersionQuery },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/topics/{id}/tree',
  tags: ['Topics'],
  summary: 'Get topic tree',
  request: { params: TopicIdParam },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/topics/shortest_path',
  tags: ['Topics'],
  summary: 'Shortest path (BFS)',
  request: { query: ShortestPathQuery },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

export function generateOpenApi() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: 'Knowledge Base API',
      version: '1.0.0',
      description:
        'Authentication required for all endpoints.\n\n' +
        'How to test via Swagger UI:\n' +
        '1) Click the "Authorize" button at the top-right.\n' +
        '2) Enter your token using the Bearer scheme (e.g., `Bearer eyJhbGciOi...`).\n' +
        '3) Click "Authorize" and then "Close".\n' +
        '4) Execute the operations below; the Authorization header will be sent automatically.\n\n' +
        'Header format: `Authorization: Bearer <your-jwt-token>`',
    },
    servers: [{ url: 'http://localhost:3000' }],
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Topics', description: 'Topic management' },
      { name: 'Resources', description: 'Resources linked to topics' },
    ],
  })
}
