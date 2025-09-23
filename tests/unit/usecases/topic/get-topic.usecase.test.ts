import { GetTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

describe('[unit] GetTopicUseCase', () => {
  it('returns latest version when no version is provided', async () => {
    const topicId = 't1'
    const head: Topic = { topicId, latestVersion: 2, deletedAt: null }
    const v2: TopicVersion = {
      id: 'v2',
      topicId,
      version: 2,
      name: 'Root',
      content: 'c2',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.UPDATE,
      performedBy: 'u-editor',
    }

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => v2),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => head),
      upsert: jest.fn(),
    } as any

    const uc = new GetTopicUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute(topicId)

    expect(res).toBe(v2)
    expect(topicVersionRepository.getByTopicAndVersion as jest.Mock).toHaveBeenCalledWith(
      topicId,
      2,
    )
  })

  it('returns specific version when version is provided', async () => {
    const topicId = 't1'
    const v1: TopicVersion = {
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
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => v1),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(),
      upsert: jest.fn(),
    } as any

    const uc = new GetTopicUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute(topicId, 1)

    expect(res).toBe(v1)
    expect(topicVersionRepository.getByTopicAndVersion as jest.Mock).toHaveBeenCalledWith(
      topicId,
      1,
    )
  })

  it('throws 404 when head not found or deleted', async () => {
    const topicId = 't1'

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(async () => null as unknown as Topic),
      upsert: jest.fn(),
    } as any

    const uc = new GetTopicUseCase(topicVersionRepository, topicRepository)

    await expect(uc.execute(topicId)).rejects.toMatchObject({ status: 404 })
  })

  it('throws 404 when specific version not found', async () => {
    const topicId = 't1'

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => null as unknown as TopicVersion),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(),
      upsert: jest.fn(),
    } as any

    const uc = new GetTopicUseCase(topicVersionRepository, topicRepository)

    await expect(uc.execute(topicId, 99)).rejects.toMatchObject({ status: 404 })
  })
})
