import { DeleteTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

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

    const uc = new DeleteTopicUseCase(topicVersionRepository, topicRepository)
    await uc.execute(topicId, 'u-admin')

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
  })
})
