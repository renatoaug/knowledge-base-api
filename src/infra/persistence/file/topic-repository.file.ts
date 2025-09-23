import { readJsonFile, writeJsonFile } from 'src/utils/fs-json'
import { Topic, TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

type VersionStore = { versions: TopicVersion[] }
type TopicStore = { topics: Topic[] }

const VERSION_FILE = 'topics.versions.json'
const TOPIC_FILE = 'topics.json'

export class TopicVersionRepositoryFile implements ITopicVersionRepository {
  async append(version: TopicVersion): Promise<void> {
    const store = await readJsonFile<VersionStore>(VERSION_FILE, { versions: [] })
    store.versions.push(version)

    await writeJsonFile(VERSION_FILE, store)
  }

  async getByTopicAndVersion(topicId: TopicId, version: number): Promise<TopicVersion | undefined> {
    const store = await readJsonFile<VersionStore>(VERSION_FILE, { versions: [] })
    return store.versions.find((v) => v.topicId === topicId && v.version === version)
  }
}

export class TopicRepositoryFile implements ITopicRepository {
  async upsert(topic: Topic): Promise<void> {
    const store = await readJsonFile<TopicStore>(TOPIC_FILE, { topics: [] })
    const idx = store.topics.findIndex((t) => t.topicId === topic.topicId)
    if (idx >= 0) store.topics[idx] = topic
    else store.topics.push(topic)

    await writeJsonFile(TOPIC_FILE, store)
  }

  async get(topicId: TopicId): Promise<Topic | undefined> {
    const store = await readJsonFile<TopicStore>(TOPIC_FILE, { topics: [] })
    return store.topics.find((t) => t.topicId === topicId)
  }
}
