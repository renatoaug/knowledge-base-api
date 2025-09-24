import { TopicController } from 'src/controllers'
import { TopicService } from 'src/services'
import { makeTopicRepositories } from 'src/infra/persistence'
import { AuthMiddleware } from 'src/middlewares'
import { RoleBasedPermissionStrategy } from 'src/security/permission'
import { ResourceController } from 'src/controllers'
import { ResourceService } from 'src/services'

export function makeTopicController(): TopicController {
  const {
    topicRepository: topics,
    topicVersionRepository: topicVersions,
    resourceRepository: resources,
  } = makeTopicRepositories('file')
  const service = new TopicService(topicVersions, topics, resources)

  return new TopicController(service)
}

export function makeResourceController(): ResourceController {
  const { resourceRepository: resources, topicRepository: topics } = makeTopicRepositories('file')
  const service = new ResourceService(resources, topics)
  return new ResourceController(service)
}

export function makeAuthMiddleware(): AuthMiddleware {
  const { userRepository: users } = makeTopicRepositories('file')
  const strategy = new RoleBasedPermissionStrategy()
  return new AuthMiddleware(users, strategy)
}
