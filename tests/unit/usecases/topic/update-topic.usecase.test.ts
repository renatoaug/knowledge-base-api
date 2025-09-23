import { UpdateTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

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
})
