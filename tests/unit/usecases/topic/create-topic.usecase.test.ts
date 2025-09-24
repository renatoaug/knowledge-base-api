import { CreateTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

describe('[unit] CreateTopicUseCase', () => {
  it('creates a new topic version and updates head', async () => {
    const versions: TopicVersion[] = []
    const topics: Topic[] = []

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async (v) => versions.push(v)),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      upsert: jest.fn(async (t) => topics.push(t)),
      get: jest.fn(),
    } as any

    const uc = new CreateTopicUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute({
      input: { name: 'Root', content: 'c' },
      performedByUserId: 'u-editor',
    })

    expect(res.version).toBe(1)
    expect(res.action).toBe(TopicAction.CREATE)
    expect(res.performedBy).toBe('u-editor')
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(1)
  })

  it('validates that parent topic exists when parentTopicId is provided', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn().mockResolvedValue(undefined),
    } as any

    const uc = new CreateTopicUseCase(topicVersionRepository, topicRepository)

    await expect(
      uc.execute({
        input: { name: 'Child', content: 'c', parentTopicId: 'non-existent-parent' },
        performedByUserId: 'u-editor',
      }),
    ).rejects.toBeInstanceOf(AppError)

    expect((topicRepository.get as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.get as jest.Mock).mock.calls[0][0]).toBe('non-existent-parent')
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(0)
    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(0)
  })

  it('validates that parent topic is not deleted when parentTopicId is provided', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn().mockResolvedValue({
        topicId: 'parent-id',
        latestVersion: 1,
        deletedAt: Date.now(),
      }),
    } as any

    const uc = new CreateTopicUseCase(topicVersionRepository, topicRepository)

    await expect(
      uc.execute({
        input: { name: 'Child', content: 'c', parentTopicId: 'deleted-parent' },
        performedByUserId: 'u-editor',
      }),
    ).rejects.toBeInstanceOf(AppError)

    expect((topicRepository.get as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.get as jest.Mock).mock.calls[0][0]).toBe('deleted-parent')
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(0)
    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(0)
  })

  it('allows creating topic with valid parentTopicId', async () => {
    const versions: TopicVersion[] = []
    const topics: Topic[] = []

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async (v) => versions.push(v)),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      upsert: jest.fn(async (t) => topics.push(t)),
      get: jest.fn().mockResolvedValue({
        topicId: 'parent-id',
        latestVersion: 1,
        deletedAt: null,
      }),
    } as any

    const uc = new CreateTopicUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute({
      input: { name: 'Child', content: 'c', parentTopicId: 'valid-parent' },
      performedByUserId: 'u-editor',
    })

    expect(res.version).toBe(1)
    expect(res.action).toBe(TopicAction.CREATE)
    expect(res.parentTopicId).toBe('valid-parent')
    expect((topicRepository.get as jest.Mock).mock.calls.length).toBe(1)
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(1)
  })
})
