import { Topic, TopicId, TopicVersion } from 'src/models'

export interface ITopicVersionRepository {
  append(version: TopicVersion): Promise<void>
  getByTopicAndVersion(topicId: TopicId, version: number): Promise<TopicVersion | undefined>
}

export interface ITopicRepository {
  upsert(head: Topic): Promise<void>
  get(topicId: TopicId): Promise<Topic | undefined>
}
