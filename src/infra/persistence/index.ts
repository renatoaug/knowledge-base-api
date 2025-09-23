import { ITopicRepository, ITopicVersionRepository, IUserRepository } from 'src/repositories'
import {
  TopicRepositoryFile,
  TopicVersionRepositoryFile,
  UserRepositoryFile,
} from 'src/infra/persistence/file'

export type PersistenceKind = 'file'

export function makeTopicRepositories(kind: PersistenceKind = 'file'): {
  topicRepository: ITopicRepository
  topicVersionRepository: ITopicVersionRepository
  userRepository: IUserRepository
} {
  switch (kind) {
    case 'file':
    default:
      return {
        topicRepository: new TopicRepositoryFile(),
        topicVersionRepository: new TopicVersionRepositoryFile(),
        userRepository: new UserRepositoryFile(),
      }
  }
}
