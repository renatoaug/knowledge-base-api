import { TopicService } from 'src/services'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

describe('[unit] TopicService - create', () => {
  it('creates a topic with version 1 and updates topic', async () => {
    const topicVersions: TopicVersion[] = []
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(async (v: TopicVersion) => {
        topicVersions.push(v)
      }),
    }

    const topics: Topic[] = []
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(async (t: Topic) => {
        topics.push(t)
      }),
    }

    const service = new TopicService(topicVersionRepository, topicRepository)

    const created = await service.create({ name: 'Root', content: 'c' })

    expect(created).toBeDefined()
    expect(created.version).toBe(1)
    expect(created.name).toBe('Root')
    expect(created.content).toBe('c')
    expect(created.parentTopicId).toBeNull()
    expect(typeof created.id).toBe('string')
    expect(typeof created.topicId).toBe('string')
    expect(new Date(created.createdAt)).toEqual(expect.any(Date))
    expect(created.updatedAt).toBe(created.createdAt)
    expect(created.action).toBe(TopicAction.CREATE)
    expect(created.performedBy).toBe('userId')

    expect((topicVersionRepository.append as jest.Mock).mock.calls.length).toBe(1)
    expect(topicVersions[0]).toMatchObject({
      topicId: created.topicId,
      version: 1,
      name: 'Root',
    })

    expect((topicRepository.upsert as jest.Mock).mock.calls.length).toBe(1)
    expect(topics[0]).toEqual({ topicId: created.topicId, latestVersion: 1, deletedAt: null })
  })
})
