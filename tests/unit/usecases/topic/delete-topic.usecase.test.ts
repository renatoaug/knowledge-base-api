import { DeleteTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository, IResourceRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

describe('[unit] DeleteTopicUseCase', () => {
  it('appends tombstone version and marks head deletedAt', async () => {
    const topicId = 't1'
    const head: Topic = { topicId, latestVersion: 1, deletedAt: null }
    const current: TopicVersion = {
      id: 'v1',
      topicId,
      version: 1,
      name: 'Root',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async () => {}),
      getByTopicAndVersion: jest.fn(async () => current),
    } as any

    let upserted: Topic | null = null
    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => head),
      upsert: jest.fn(async (t) => {
        upserted = t
      }),
      findChildren: jest.fn(async () => []),
    } as any

    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(async () => {}),
    } as any

    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await uc.execute({ topicId, performedByUserId: 'u-admin' })

    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    const appended = (topicVersionRepository.append as jest.Mock).mock.calls[0][0] as TopicVersion
    expect(appended.topicId).toBe(topicId)
    expect(appended.version).toBe(2)
    expect(appended.action).toBe(TopicAction.DELETE)
    expect(appended.performedBy).toBe('u-admin')

    expect(upserted).not.toBeNull()
    expect(upserted!.topicId).toBe(topicId)
    expect(upserted!.latestVersion).toBe(2)
    expect(typeof upserted!.deletedAt).toBe('number')

    expect((resourceRepository.deleteByTopic as jest.Mock).mock.calls.length).toBe(1)
    expect((resourceRepository.deleteByTopic as jest.Mock).mock.calls[0][0]).toBe(topicId)
  })

  it('throws 404 when head not found', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => undefined),
      upsert: jest.fn(),
      findChildren: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any
    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await expect(uc.execute({ topicId: 't1', performedByUserId: 'u' })).rejects.toBeInstanceOf(
      AppError,
    )
  })

  it('throws 404 when head is already deleted', async () => {
    const head: Topic = { topicId: 't1', latestVersion: 1, deletedAt: Date.now() }
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => head),
      upsert: jest.fn(),
      findChildren: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any
    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)

    await expect(uc.execute({ topicId: 't1', performedByUserId: 'u' })).rejects.toBeInstanceOf(
      AppError,
    )

    expect(topicVersionRepository.append).not.toHaveBeenCalled()
    expect(topicRepository.upsert).not.toHaveBeenCalled()
    expect(resourceRepository.deleteByTopic).not.toHaveBeenCalled()
  })

  it('throws 404 when current version not found', async () => {
    const head: Topic = { topicId: 't1', latestVersion: 1, deletedAt: null }
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => undefined),
    } as any
    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => head),
      upsert: jest.fn(),
      findChildren: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any
    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await expect(uc.execute({ topicId: 't1', performedByUserId: 'u' })).rejects.toBeInstanceOf(
      AppError,
    )
  })

  it('cascade deletes all children recursively', async () => {
    const parentId = 'parent'
    const child1Id = 'child1'
    const child2Id = 'child2'
    const grandchildId = 'grandchild'

    const parent: Topic = { topicId: parentId, latestVersion: 1, deletedAt: null }
    const child1: Topic = { topicId: child1Id, latestVersion: 1, deletedAt: null }
    const child2: Topic = { topicId: child2Id, latestVersion: 1, deletedAt: null }
    const grandchild: Topic = { topicId: grandchildId, latestVersion: 1, deletedAt: null }

    const parentVersion: TopicVersion = {
      id: 'v1',
      topicId: parentId,
      version: 1,
      name: 'Parent',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const child1Version: TopicVersion = {
      id: 'v2',
      topicId: child1Id,
      version: 1,
      name: 'Child1',
      content: 'c',
      parentTopicId: parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const child2Version: TopicVersion = {
      id: 'v3',
      topicId: child2Id,
      version: 1,
      name: 'Child2',
      content: 'c',
      parentTopicId: parentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const grandchildVersion: TopicVersion = {
      id: 'v4',
      topicId: grandchildId,
      version: 1,
      name: 'Grandchild',
      content: 'c',
      parentTopicId: child1Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const appendedVersions: TopicVersion[] = []
    const upsertedTopics: Topic[] = []
    const deletedResources: string[] = []

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async (v) => appendedVersions.push(v)),
      getByTopicAndVersion: jest.fn(async (topicId) => {
        if (topicId === parentId) return parentVersion
        if (topicId === child1Id) return child1Version
        if (topicId === child2Id) return child2Version
        if (topicId === grandchildId) return grandchildVersion
        return undefined
      }),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(async (topicId) => {
        if (topicId === parentId) return parent
        if (topicId === child1Id) return child1
        if (topicId === child2Id) return child2
        if (topicId === grandchildId) return grandchild
        return undefined
      }),
      upsert: jest.fn(async (t) => upsertedTopics.push(t)),
      findChildren: jest.fn(async (topicId) => {
        if (topicId === parentId) return [child1, child2]
        if (topicId === child1Id) return [grandchild]
        if (topicId === child2Id) return []
        if (topicId === grandchildId) return []
        return []
      }),
    } as any

    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(async (topicId) => deletedResources.push(topicId)),
    } as any

    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await uc.execute({ topicId: parentId, performedByUserId: 'u-admin' })

    expect(appendedVersions).toHaveLength(4)
    expect(appendedVersions[0].topicId).toBe(grandchildId)
    expect(appendedVersions[1].topicId).toBe(child1Id)
    expect(appendedVersions[2].topicId).toBe(child2Id)
    expect(appendedVersions[3].topicId).toBe(parentId)

    expect(upsertedTopics).toHaveLength(4)
    expect(upsertedTopics.every((t) => t.deletedAt !== null)).toBe(true)

    expect(deletedResources).toHaveLength(4)
    expect(deletedResources).toContain(grandchildId)
    expect(deletedResources).toContain(child1Id)
    expect(deletedResources).toContain(child2Id)
    expect(deletedResources).toContain(parentId)
  })

  it('throws 404 when trying to delete parent with already deleted child', async () => {
    const parentId = 'parent'
    const childId = 'child'

    const parent: Topic = { topicId: parentId, latestVersion: 1, deletedAt: null }
    const child: Topic = { topicId: childId, latestVersion: 1, deletedAt: Date.now() } // Already deleted

    const parentVersion: TopicVersion = {
      id: 'v1',
      topicId: parentId,
      version: 1,
      name: 'Parent',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => parentVersion),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(async (topicId) => {
        if (topicId === parentId) return parent
        if (topicId === childId) return child
        return undefined
      }),
      upsert: jest.fn(),
      findChildren: jest.fn(async (topicId) => {
        if (topicId === parentId) return [child]
        return []
      }),
    } as any

    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any

    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)

    await expect(
      uc.execute({ topicId: parentId, performedByUserId: 'u-admin' }),
    ).rejects.toBeInstanceOf(AppError)

    expect(topicVersionRepository.append).not.toHaveBeenCalled()
    expect(topicRepository.upsert).not.toHaveBeenCalled()
    expect(resourceRepository.deleteByTopic).not.toHaveBeenCalled()
  })
})
