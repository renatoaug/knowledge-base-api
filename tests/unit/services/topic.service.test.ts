import { TopicService } from 'src/services'
import { TopicVersion, TopicAction } from 'src/models'
import { User } from 'src/models/user'
import {
  CreateTopicUseCase,
  UpdateTopicUseCase,
  GetTopicUseCase,
  DeleteTopicUseCase,
} from 'src/usecases/topic'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

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

    const service = new TopicService(topicVersionRepository, topicRepository)
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

    expect(spy).toHaveBeenCalledWith(input, user.id)
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

    const service = new TopicService(topicVersionRepository, topicRepository)
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

    expect(spy).toHaveBeenCalledWith('t1', { content: 'c2' }, user.id)
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

    const service = new TopicService(topicVersionRepository, topicRepository)

    const spy = jest.spyOn(DeleteTopicUseCase.prototype, 'execute').mockResolvedValue()

    await service.delete('t1', user)

    expect(spy).toHaveBeenCalledWith('t1', user.id)
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

    const service = new TopicService(topicVersionRepository, topicRepository)

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
})
