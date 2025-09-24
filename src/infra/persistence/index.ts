import {
  ITopicRepository,
  ITopicVersionRepository,
  IUserRepository,
  IResourceRepository,
} from 'src/repositories'
import {
  TopicRepositoryFile,
  TopicVersionRepositoryFile,
  UserRepositoryFile,
  ResourceRepositoryFile,
} from 'src/infra/persistence/file'

export type PersistenceKind = 'file'

export function makeTopicRepositories(kind: PersistenceKind = 'file'): {
  topicRepository: ITopicRepository
  topicVersionRepository: ITopicVersionRepository
  userRepository: IUserRepository
  resourceRepository: IResourceRepository
} {
  switch (kind) {
    case 'file':
    default:
      return {
        topicRepository: new TopicRepositoryFile(),
        topicVersionRepository: new TopicVersionRepositoryFile(),
        userRepository: new UserRepositoryFile(),
        resourceRepository: new ResourceRepositoryFile(),
      }
  }
}
