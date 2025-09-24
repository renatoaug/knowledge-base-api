import { TopicService } from 'src/services'
import { TopicVersion, TopicAction, TopicTreeNode } from 'src/models/topic'
import { User } from 'src/models/user'
import {
  CreateTopicUseCase,
  UpdateTopicUseCase,
  GetTopicUseCase,
  DeleteTopicUseCase,
} from 'src/usecases/topic'
import { ITopicRepository, ITopicVersionRepository, IResourceRepository } from 'src/repositories'
import { GetTopicTreeUseCase } from 'src/usecases/topic'

describe('[unit] TopicService', () => {
  it('create delegates to CreateTopicUseCase.execute', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    } as any

    const service = new TopicService(topicVersionRepository, topicRepository, resourceRepository)
    const user: User = {
      id: 'u-editor',
      name: 'Editor',
      email: 'editor@example.com',
      role: 'Editor' as any,
      createdAt: Date.now(),
    }

    const spy = jest.spyOn(CreateTopicUseCase.prototype, 'execute').mockResolvedValue({
      id: 'v1',
      topicId: 't1',
      version: 1,
      name: 'Root',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: user.id,
    } as TopicVersion)

    const input = { name: 'Root', content: 'c' }
    const created = await service.create(input, user)

    expect(spy).toHaveBeenCalledWith({ input, performedByUserId: user.id })
    expect(created.version).toBe(1)
    spy.mockRestore()
  })

  it('update delegates to UpdateTopicUseCase.execute', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    } as any

    const service = new TopicService(topicVersionRepository, topicRepository, resourceRepository)
    const user: User = {
      id: 'u-editor',
      name: 'Editor',
      email: 'editor@example.com',
      role: 'Editor' as any,
      createdAt: Date.now(),
    }

    const spy = jest.spyOn(UpdateTopicUseCase.prototype, 'execute').mockResolvedValue({
      id: 'v2',
      topicId: 't1',
      version: 2,
      name: 'Root',
      content: 'c2',
      parentTopicId: null,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
      action: TopicAction.UPDATE,
      performedBy: user.id,
    } as TopicVersion)

    const res = await service.update('t1', { content: 'c2' }, user)

    expect(spy).toHaveBeenCalledWith({
      topicId: 't1',
      input: { content: 'c2' },
      performedByUserId: user.id,
    })
    expect(res.version).toBe(2)
    spy.mockRestore()
  })

  it('delete delegates to DeleteTopicUseCase.execute', async () => {
    const user: User = {
      id: 'u-admin',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'Admin' as any,
      createdAt: Date.now(),
    }

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    } as any

    const service = new TopicService(topicVersionRepository, topicRepository, resourceRepository)

    const spy = jest.spyOn(DeleteTopicUseCase.prototype, 'execute').mockResolvedValue()

    await service.delete('t1', user)

    expect(spy).toHaveBeenCalledWith({ topicId: 't1', performedByUserId: user.id })
    spy.mockRestore()
  })

  it('get delegates to GetTopicUseCase.execute', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    } as any

    const service = new TopicService(topicVersionRepository, topicRepository, resourceRepository)

    const spy = jest.spyOn(GetTopicUseCase.prototype, 'execute').mockResolvedValue({
      id: 'v2',
      topicId: 't1',
      version: 2,
      name: 'Root',
      content: 'c2',
      parentTopicId: null,
      createdAt: Date.now() - 1000,
      updatedAt: Date.now(),
      action: TopicAction.UPDATE,
      performedBy: 'u-editor',
    } as TopicVersion)

    const res = await service.get('t1', 2)

    expect(spy).toHaveBeenCalledWith('t1', 2)
    expect(res.version).toBe(2)
    spy.mockRestore()
  })

  it('getTree delegates to GetTopicTreeUseCase.execute', async () => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
    } as any
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(),
    } as any
    const resourceRepository: IResourceRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTopic: jest.fn(),
      get: jest.fn(),
      listByTopic: jest.fn(),
    } as any

    const service = new TopicService(topicVersionRepository, topicRepository, resourceRepository)

    const spy = jest.spyOn(GetTopicTreeUseCase.prototype, 'execute').mockResolvedValue({
      topicId: 't1',
      name: 'Root',
      children: [],
    } as TopicTreeNode)

    const res = await service.getTree('t1')

    expect(spy).toHaveBeenCalledWith('t1')
    expect(res).toEqual({
      topicId: 't1',
      name: 'Root',
      children: [],
    })
  })
})
