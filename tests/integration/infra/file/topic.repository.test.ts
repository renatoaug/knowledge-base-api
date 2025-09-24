import crypto from 'node:crypto'
import { TopicRepositoryFile, TopicVersionRepositoryFile } from 'src/infra/persistence/file'
import { TopicAction } from 'src/models'

describe('[integration] Topic repository', () => {
  beforeAll(async () => {
    const topicVersionRepository = new TopicVersionRepositoryFile()
    const topicRepository = new TopicRepositoryFile()

    await topicVersionRepository.append({
      id: crypto.randomUUID(),
      topicId: 't1',
      version: 1,
      name: 'Root',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    })

    await topicRepository.upsert({ topicId: 't1', latestVersion: 1, deletedAt: null })
  })

  it('[append] appends a version and upserts topic into JSON files', async () => {
    const topicVersionRepository = new TopicVersionRepositoryFile()
    const topicRepository = new TopicRepositoryFile()

    await topicVersionRepository.append({
      id: crypto.randomUUID(),
      topicId: 't1',
      version: 2,
      name: 'Root',
      content: 'c',
      parentTopicId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      action: TopicAction.CREATE,
      performedBy: 'u-editor',
    })

    await topicRepository.upsert({ topicId: 't1', latestVersion: 2, deletedAt: null })

    const versions = await topicVersionRepository.listAll()
    const topics = await topicRepository.listAll()

    expect(versions).toHaveLength(2)
    expect(topics).toHaveLength(1)
    expect(topics[0]).toEqual({ topicId: 't1', latestVersion: 2, deletedAt: null })
  })

  it('[upsert] upserts topic into JSON files', async () => {
    const topicRepository = new TopicRepositoryFile()

    await topicRepository.upsert({ topicId: 't1', latestVersion: 1, deletedAt: null })
    const topics = await topicRepository.listAll()

    expect(topics).toHaveLength(1)
    expect(topics[0]).toEqual({ topicId: 't1', latestVersion: 1, deletedAt: null })
  })

  it('[get] gets topic from JSON files', async () => {
    const topicRepository = new TopicRepositoryFile()

    const topic = await topicRepository.get('t1')

    expect(topic).toEqual({ topicId: 't1', latestVersion: 1, deletedAt: null })
  })

  it('[listAll] lists all topics from JSON files', async () => {
    const topicRepository = new TopicRepositoryFile()

    const topics = await topicRepository.listAll()

    expect(topics).toHaveLength(1)
    expect(topics[0]).toEqual({ topicId: 't1', latestVersion: 1, deletedAt: null })
  })
})
