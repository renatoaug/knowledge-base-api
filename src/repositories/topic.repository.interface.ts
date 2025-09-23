import { Topic, TopicVersion } from 'src/models'

export interface ITopicVersionRepository {
  append(version: TopicVersion): Promise<void>
}

export interface ITopicRepository {
  upsert(head: Topic): Promise<void>
}
