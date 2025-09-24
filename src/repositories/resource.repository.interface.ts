import { Resource, ResourceId } from 'src/models'

export interface IResourceRepository {
  create(resource: Resource): Promise<void>
  update(resource: Resource): Promise<void>
  delete(resourceId: ResourceId): Promise<void>
  deleteByTopic(topicId: string): Promise<void>
  get(resourceId: ResourceId): Promise<Resource | undefined>
  listByTopic(topicId: string): Promise<Resource[]>
}
