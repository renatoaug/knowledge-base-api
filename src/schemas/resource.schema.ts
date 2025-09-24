import { z } from 'zod'
import { registry } from 'src/schemas'
import { ResourceType } from 'src/models'

export const CreateResourceSchema = z
  .object({
    topicId: z.uuid().openapi({ example: 'aecaf129-68f6-4a53-902f-5581581c8a5c' }),
    url: z.url().openapi({ example: 'https://example.com' }),
    description: z.string().min(1).openapi({ example: 'Great article' }),
    type: z.enum(['video', 'article', 'pdf', 'link']).openapi({ example: 'article' }),
  })
  .openapi('CreateResourceInput')

export const UpdateResourceSchema = z
  .object({
    url: z.url().optional().openapi({ example: 'https://example.com/new' }),
    description: z.string().min(1).optional().openapi({ example: 'Updated description' }),
    type: z.enum(['video', 'article', 'pdf', 'link']).optional().openapi({ example: 'pdf' }),
  })
  .openapi('UpdateResourceInput')

export const ResourceIdParam = z.object({
  id: z.uuid().openapi({ example: 'f1a2e3d4-5678-4abc-9def-0123456789ab' }),
})

export const ResourceSchema = z
  .object({
    id: z.uuid(),
    topicId: z.uuid(),
    url: z.url(),
    description: z.string(),
    type: z.enum([ResourceType.VIDEO, ResourceType.ARTICLE, ResourceType.PDF, ResourceType.LINK]),
    createdAt: z.number(),
    updatedAt: z.number(),
  })
  .openapi('Resource')

registry.registerPath({
  method: 'post',
  path: '/resources',
  tags: ['Resources'],
  summary: 'Create resource',
  request: { body: { content: { 'application/json': { schema: CreateResourceSchema } } } },
  security: [{ BearerAuth: [] }],
  responses: {
    201: { description: 'Created', content: { 'application/json': { schema: ResourceSchema } } },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
})

registry.registerPath({
  method: 'put',
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Update resource',
  request: {
    params: ResourceIdParam,
    body: { content: { 'application/json': { schema: UpdateResourceSchema } } },
  },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: ResourceSchema } } },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Delete resource',
  request: { params: ResourceIdParam },
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
  path: '/resources/{id}',
  tags: ['Resources'],
  summary: 'Get resource',
  request: { params: ResourceIdParam },
  security: [{ BearerAuth: [] }],
  responses: {
    200: { description: 'OK', content: { 'application/json': { schema: ResourceSchema } } },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})

registry.registerPath({
  method: 'get',
  path: '/topics/{id}/resources',
  tags: ['Resources'],
  summary: 'List resources by topic',
  request: { params: z.object({ id: z.uuid() }) },
  security: [{ BearerAuth: [] }],
  responses: {
    200: {
      description: 'OK',
      content: { 'application/json': { schema: z.array(ResourceSchema) } },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
    404: { description: 'Not Found' },
  },
})
