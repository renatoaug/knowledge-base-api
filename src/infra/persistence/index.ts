import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { TopicRepositoryFile, TopicVersionRepositoryFile } from 'src/infra/persistence/file'

export type PersistenceKind = 'file'

export function makeTopicRepositories(kind: PersistenceKind = 'file'): {
  topicRepository: ITopicRepository
  topicVersionRepository: ITopicVersionRepository
} {
  switch (kind) {
    case 'file':
    default:
      return {
        topicRepository: new TopicRepositoryFile(),
        topicVersionRepository: new TopicVersionRepositoryFile(),
      }
  }
}
