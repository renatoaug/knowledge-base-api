import { ResourceService } from 'src/services'
import { IResourceRepository, ITopicRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'
import { ResourceType } from 'src/models'

describe('[unit] ResourceService', () => {
  const fixedNow = 1716768123456
  let resources: jest.Mocked<IResourceRepository>
  let topics: jest.Mocked<ITopicRepository>
  let service: ResourceService

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(fixedNow)

    resources = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    }

    topics = {
      upsert: jest.fn(),
      get: jest.fn(),
      listAll: jest.fn(),
      findChildren: jest.fn(),
    }

    service = new ResourceService(resources, topics)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('create: creates resource when topic exists', async () => {
    topics.get.mockResolvedValue({ topicId: 't1', latestVersion: 1, deletedAt: null })

    const res = await service.create({
      topicId: 't1',
      url: 'https://example.com',
      description: 'Great article',
      type: ResourceType.ARTICLE,
    })

    expect(resources.create).toHaveBeenCalled()
    expect(res.topicId).toBe('t1')
    expect(res.url).toBe('https://example.com')
    expect(res.createdAt).toBe(fixedNow)
    expect(res.updatedAt).toBe(fixedNow)
  })

  it('create: throws 404 if topic not found or deleted', async () => {
    topics.get.mockResolvedValue(undefined)
    await expect(
      service.create({
        topicId: 't1',
        url: 'https://e.com',
        description: 'd',
        type: ResourceType.LINK,
      }),
    ).rejects.toBeInstanceOf(AppError)

    topics.get.mockResolvedValue({ topicId: 't1', latestVersion: 1, deletedAt: fixedNow })
    await expect(
      service.create({
        topicId: 't1',
        url: 'https://e.com',
        description: 'd',
        type: ResourceType.LINK,
      }),
    ).rejects.toBeInstanceOf(AppError)
  })

  it('update: updates existing resource', async () => {
    resources.get.mockResolvedValue({
      id: 'r1',
      topicId: 't1',
      url: 'https://old',
      description: 'old',
      type: ResourceType.ARTICLE,
      createdAt: fixedNow - 1000,
      updatedAt: fixedNow - 1000,
    })

    const res = await service.update('r1', { description: 'new' })
    expect(resources.update).toHaveBeenCalled()
    expect(res.description).toBe('new')
    expect(res.updatedAt).toBe(fixedNow)
  })

  it('update: throws 404 when resource not found', async () => {
    resources.get.mockResolvedValue(undefined)
    await expect(service.update('r1', { description: 'x' })).rejects.toBeInstanceOf(AppError)
  })

  it('delete: deletes existing', async () => {
    resources.get.mockResolvedValue({
      id: 'r1',
      topicId: 't1',
      url: 'https://old',
      description: 'old',
      type: ResourceType.ARTICLE,
      createdAt: fixedNow - 1000,
      updatedAt: fixedNow - 1000,
    })

    await service.delete('r1')
    expect(resources.delete).toHaveBeenCalledWith('r1')
  })

  it('delete: throws 404 when not found', async () => {
    resources.get.mockResolvedValue(undefined)
    await expect(service.delete('nope')).rejects.toBeInstanceOf(AppError)
  })

  it('get: returns resource', async () => {
    resources.get.mockResolvedValue({
      id: 'r1',
      topicId: 't1',
      url: 'https://old',
      description: 'old',
      type: ResourceType.ARTICLE,
      createdAt: fixedNow - 1000,
      updatedAt: fixedNow - 1000,
    })

    const res = await service.get('r1')
    expect(res.id).toBe('r1')
  })

  it('get: throws 404 when not found', async () => {
    resources.get.mockResolvedValue(undefined)
    await expect(service.get('nope')).rejects.toBeInstanceOf(AppError)
  })

  it('listByTopic: ok when topic exists', async () => {
    topics.get.mockResolvedValue({ topicId: 't1', latestVersion: 1, deletedAt: null })
    resources.listByTopic.mockResolvedValue([
      {
        id: 'r1',
        topicId: 't1',
        url: 'https://a',
        description: 'd',
        type: ResourceType.LINK,
        createdAt: fixedNow - 2,
        updatedAt: fixedNow - 1,
      },
    ])

    const list = await service.listByTopic('t1')
    expect(list.length).toBe(1)
  })

  it('listByTopic: throws 404 when topic missing/deleted', async () => {
    topics.get.mockResolvedValue(undefined)
    await expect(service.listByTopic('t1')).rejects.toBeInstanceOf(AppError)
  })
})
