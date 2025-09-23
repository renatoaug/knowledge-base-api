import crypto from 'node:crypto'
import path from 'node:path'
import { promises as fs } from 'node:fs'
import { TopicRepositoryFile, TopicVersionRepositoryFile } from 'src/infra/persistence/file'
import { TopicAction } from 'src/models'

describe('[integration] Topic repository', () => {
  it('appends a version and upserts topic into JSON files', async () => {
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

    const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data')
    const versionFile = path.join(dataDir, 'topics.versions.json')
    const topicFile = path.join(dataDir, 'topics.json')

    const versionsRaw = JSON.parse(await fs.readFile(versionFile, 'utf-8'))
    const topicsRaw = JSON.parse(await fs.readFile(topicFile, 'utf-8'))

    expect(versionsRaw.versions).toHaveLength(1)
    expect(topicsRaw.topics).toHaveLength(1)
    expect(topicsRaw.topics[0]).toEqual({ topicId: 't1', latestVersion: 1, deletedAt: null })
  })
})
