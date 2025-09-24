import { readJsonFile, writeJsonFile } from 'src/utils/fs-json'
import { Resource, ResourceId } from 'src/models'
import { IResourceRepository } from 'src/repositories'

const RESOURCE_FILE = 'resources.json'

type ResourceStore = { resources: Resource[] }

export class ResourceRepositoryFile implements IResourceRepository {
  async create(resource: Resource): Promise<void> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    store.resources.push(resource)

    await writeJsonFile(RESOURCE_FILE, store)
  }

  async update(resource: Resource): Promise<void> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    const idx = store.resources.findIndex((r) => r.id === resource.id)
    if (idx >= 0) store.resources[idx] = resource
    else store.resources.push(resource)

    await writeJsonFile(RESOURCE_FILE, store)
  }

  async delete(resourceId: ResourceId): Promise<void> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    const now = Date.now()

    const updated = store.resources.map((r) => (r.id === resourceId ? { ...r, deletedAt: now } : r))

    await writeJsonFile(RESOURCE_FILE, { resources: updated })
  }

  async deleteByTopic(topicId: string): Promise<void> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    const now = Date.now()

    const updated = store.resources.map((r) =>
      r.topicId === topicId ? { ...r, deletedAt: now } : r,
    )

    await writeJsonFile(RESOURCE_FILE, { resources: updated })
  }

  async get(resourceId: ResourceId): Promise<Resource | undefined> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    return store.resources.find((r) => r.id === resourceId && !r.deletedAt)
  }

  async listByTopic(topicId: string): Promise<Resource[]> {
    const store = await readJsonFile<ResourceStore>(RESOURCE_FILE, { resources: [] })
    return store.resources.filter((r) => r.topicId === topicId && !r.deletedAt)
  }
}
