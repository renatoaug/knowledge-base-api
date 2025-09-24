import { promises as fs } from 'node:fs'
import path from 'node:path'
import { ResourceRepositoryFile } from 'src/infra/persistence/file'
import { Resource, ResourceType } from 'src/models'

describe('[integration] ResourceRepositoryFile', () => {
  let repository: ResourceRepositoryFile

  beforeAll(() => {
    repository = new ResourceRepositoryFile()
  })

  beforeEach(async () => {
    const dataFile = path.join(process.env.DATA_DIR!, 'resources.json')
    try {
      await fs.unlink(dataFile)
    } catch {}
  })

  describe('deleteByTopic', () => {
    it('soft deletes all resources for a specific topic', async () => {
      const topicId = 'topic-1'
      const otherTopicId = 'topic-2'
      const now = Date.now()

      const resource1: Resource = {
        id: 'resource-1',
        topicId,
        url: 'https://example1.com',
        description: 'Resource 1',
        type: ResourceType.ARTICLE,
        createdAt: now,
        updatedAt: now,
      }

      const resource2: Resource = {
        id: 'resource-2',
        topicId,
        url: 'https://example2.com',
        description: 'Resource 2',
        type: ResourceType.VIDEO,
        createdAt: now + 1000,
        updatedAt: now + 1000,
      }

      const resource3: Resource = {
        id: 'resource-3',
        topicId: otherTopicId,
        url: 'https://example3.com',
        description: 'Resource 3',
        type: ResourceType.LINK,
        createdAt: now + 2000,
        updatedAt: now + 2000,
      }

      await repository.create(resource1)
      await repository.create(resource2)
      await repository.create(resource3)

      const allResources = await repository.listByTopic(topicId)
      const otherTopicResources = await repository.listByTopic(otherTopicId)
      expect(allResources).toHaveLength(2)
      expect(otherTopicResources).toHaveLength(1)

      await repository.deleteByTopic(topicId)

      const deletedResources = await repository.listByTopic(topicId)
      expect(deletedResources).toHaveLength(0)

      const remainingResources = await repository.listByTopic(otherTopicId)
      expect(remainingResources).toHaveLength(1)
      expect(remainingResources[0].id).toBe('resource-3')

      const getResource1 = await repository.get('resource-1')
      const getResource2 = await repository.get('resource-2')
      expect(getResource1).toBeUndefined()
      expect(getResource2).toBeUndefined()

      const getResource3 = await repository.get('resource-3')
      expect(getResource3).toBeDefined()
      expect(getResource3?.id).toBe('resource-3')
    })

    it('handles topic with no resources', async () => {
      const topicId = 'topic-with-no-resources'
      const otherTopicId = 'topic-with-resources'
      const now = Date.now()

      const resource: Resource = {
        id: 'resource-1',
        topicId: otherTopicId,
        url: 'https://example.com',
        description: 'Resource',
        type: ResourceType.ARTICLE,
        createdAt: now,
        updatedAt: now,
      }

      await repository.create(resource)

      const resources = await repository.listByTopic(otherTopicId)
      expect(resources).toHaveLength(1)

      await repository.deleteByTopic(topicId)

      const remainingResources = await repository.listByTopic(otherTopicId)
      expect(remainingResources).toHaveLength(1)
      expect(remainingResources[0].id).toBe('resource-1')
    })

    it('handles empty repository', async () => {
      const topicId = 'any-topic'

      await repository.deleteByTopic(topicId)

      const resources = await repository.listByTopic(topicId)
      expect(resources).toHaveLength(0)
    })

    it('soft deletes resources that are not already deleted', async () => {
      const topicId = 'topic-1'
      const now = Date.now()

      const resource: Resource = {
        id: 'resource-1',
        topicId,
        url: 'https://example.com',
        description: 'Resource',
        type: ResourceType.ARTICLE,
        createdAt: now,
        updatedAt: now,
      }

      await repository.create(resource)

      const existingResource = await repository.get('resource-1')
      expect(existingResource).toBeDefined()
      expect(existingResource?.deletedAt).toBeUndefined()

      await repository.deleteByTopic(topicId)

      const deletedResource = await repository.get('resource-1')
      expect(deletedResource).toBeUndefined()

      const resources = await repository.listByTopic(topicId)
      expect(resources).toHaveLength(0)
    })
  })
})
