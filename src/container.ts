import { TopicController } from 'src/controllers'
import { TopicService } from 'src/services'
import { makeTopicRepositories } from 'src/infra/persistence'

export function makeTopicController(): TopicController {
  const { topicRepository: topics, topicVersionRepository: topicVersions } =
    makeTopicRepositories('file')
  const service = new TopicService(topicVersions, topics)

  return new TopicController(service)
}
