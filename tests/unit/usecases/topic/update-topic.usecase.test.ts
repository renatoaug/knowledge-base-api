import { UpdateTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

describe('[unit] UpdateTopicUseCase', () => {
  it('creates a new version on update and bumps head', async () => {
    const topicId = 't1'
    const head = { topicId, latestVersion: 1, deletedAt: null }
    const v1: TopicVersion = {
      id: 'v1',
      topicId,
      version: 1,
      name: 'Root',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000,
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    }

    const versions: TopicVersion[] = [v1]

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async (v) => versions.push(v)),
      getByTopicAndVersion: jest.fn(async () => v1),
    } as any

    const updatedHeads: Topic[] = []
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(async (t) => updatedHeads.push(t)),
      get: jest.fn(async () => head),
    } as any

    const uc = new UpdateTopicUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute(topicId, { content: 'c2' }, 'u-editor')

    expect(res.version).toBe(2)
    expect(res.content).toBe('c2')
    expect(res.action).toBe(TopicAction.UPDATE)
    expect(res.performedBy).toBe('u-editor')
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.upsert as jest.Mock).mock.calls[0][0]).toMatchObject({
      topicId,
      latestVersion: 2,
    })
  })

  it('throws 404 when head not found or deleted', async () => {
    const tv: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const tr: ITopicRepository = { get: jest.fn(async () => undefined), upsert: jest.fn() } as any
    const uc = new UpdateTopicUseCase(tv, tr)
    await expect(uc.execute('t', {}, 'u')).rejects.toBeInstanceOf(AppError)

    const tr2: ITopicRepository = {
      get: jest.fn(async () => ({ topicId: 't', latestVersion: 1, deletedAt: Date.now() })),
      upsert: jest.fn(),
    } as any
    const uc2 = new UpdateTopicUseCase(tv, tr2)
    await expect(uc2.execute('t', {}, 'u')).rejects.toBeInstanceOf(AppError)
  })

  it('throws 404 when current version not found', async () => {
    const head: Topic = { topicId: 't', latestVersion: 1, deletedAt: null }
    const tv: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => undefined),
    } as any
    const tr: ITopicRepository = { get: jest.fn(async () => head), upsert: jest.fn() } as any
    const uc = new UpdateTopicUseCase(tv, tr)
    await expect(uc.execute('t', {}, 'u')).rejects.toBeInstanceOf(AppError)
  })

  it('resolves parentTopicId override and preserves when undefined', async () => {
    const head: Topic = { topicId: 't', latestVersion: 1, deletedAt: null }
    const v1: TopicVersion = {
      id: 'v1',
      topicId: 't',
      version: 1,
      name: 'N',
      content: 'C',
      parentTopicId: 'p1',
      createdAt: 1,
      updatedAt: 1,
      action: TopicAction.CREATE,
      performedBy: 'u',
    }
    const tv: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(async () => v1),
    } as any
    const tr: ITopicRepository = { get: jest.fn(async () => head), upsert: jest.fn() } as any
    const uc = new UpdateTopicUseCase(tv, tr)
    const r1 = await uc.execute('t', { parentTopicId: null }, 'u')
    expect(r1.parentTopicId).toBeNull()
    const r2 = await uc.execute('t', { content: 'C2' }, 'u')
    expect(r2.parentTopicId).toBe('p1')
  })
})
