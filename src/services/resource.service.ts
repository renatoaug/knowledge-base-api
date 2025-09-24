import { IResourceRepository, ITopicRepository } from 'src/repositories'
import { Resource, ResourceId, ResourceType } from 'src/models'
import { AppError } from 'src/middlewares'

export interface CreateResourceInput {
  topicId: string
  url: string
  description: string
  type: ResourceType
}

export interface UpdateResourceInput {
  url?: string
  description?: string
  type?: ResourceType
}

export class ResourceService {
  constructor(
    private readonly resources: IResourceRepository,
    private readonly topics: ITopicRepository,
  ) {}

  async create(input: CreateResourceInput): Promise<Resource> {
    const topic = await this.topics.get(input.topicId)
    if (!topic || topic.deletedAt) throw new AppError(404, 'Topic not found')

    const now = Date.now()
    const id = (await import('node:crypto')).randomUUID()
    const resource: Resource = {
      id,
      topicId: input.topicId,
      url: input.url,
      description: input.description,
      type: input.type,
      createdAt: now,
      updatedAt: now,
    }
    await this.resources.create(resource)

    return resource
  }

  async update(id: ResourceId, input: UpdateResourceInput): Promise<Resource> {
    const existing = await this.resources.get(id)
    if (!existing) throw new AppError(404, 'Resource not found')

    const updated: Resource = {
      ...existing,
      url: input.url ?? existing.url,
      description: input.description ?? existing.description,
      type: input.type ?? existing.type,
      updatedAt: Date.now(),
    }
    await this.resources.update(updated)

    return updated
  }

  async delete(id: ResourceId): Promise<void> {
    const existing = await this.resources.get(id)
    if (!existing) throw new AppError(404, 'Resource not found')
    await this.resources.delete(id)
  }

  async get(id: ResourceId): Promise<Resource> {
    const existing = await this.resources.get(id)
    if (!existing) throw new AppError(404, 'Resource not found')

    return existing
  }

  async listByTopic(topicId: string): Promise<Resource[]> {
    const topic = await this.topics.get(topicId)
    if (!topic || topic.deletedAt) throw new AppError(404, 'Topic not found')

    return this.resources.listByTopic(topicId)
  }
}
