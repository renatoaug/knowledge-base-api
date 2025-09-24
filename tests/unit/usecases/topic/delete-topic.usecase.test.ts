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
    } as any
    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any
    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await expect(uc.execute({ topicId: 't1', performedByUserId: 'u' })).rejects.toBeInstanceOf(
      AppError,
    )
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
    } as any
    const resourceRepository: IResourceRepository = {
      deleteByTopic: jest.fn(),
    } as any
    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository, resourceRepository)
    await expect(uc.execute({ topicId: 't1', performedByUserId: 'u' })).rejects.toBeInstanceOf(
      AppError,
    )
  })
})
