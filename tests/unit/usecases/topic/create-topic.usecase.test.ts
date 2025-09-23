import { CreateTopicUseCase } from 'src/usecases/topic'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

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
    const res = await uc.execute({ name: 'Root', content: 'c' }, 'u-editor')

    expect(res.version).toBe(1)
    expect(res.action).toBe(TopicAction.CREATE)
    expect(res.performedBy).toBe('u-editor')
    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(1)
  })
})
