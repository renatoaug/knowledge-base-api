import { TopicController } from 'src/controllers'
import { TopicService } from 'src/services'
import { makeTopicRepositories } from 'src/infra/persistence'
import { AuthMiddleware } from 'src/middleware'

export function makeTopicController(): TopicController {
  const { topicRepository: topics, topicVersionRepository: topicVersions } =
    makeTopicRepositories('file')
  const service = new TopicService(topicVersions, topics)

  return new TopicController(service)
}

export function makeAuthMiddleware(): AuthMiddleware {
  const { userRepository: users } = makeTopicRepositories('file')
  return new AuthMiddleware(users)
}
