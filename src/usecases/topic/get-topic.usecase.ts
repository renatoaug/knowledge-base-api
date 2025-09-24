import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'
import { UseCase } from 'src/usecases'

export class GetTopicUseCase extends UseCase<TopicId, TopicVersion> {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {
    super()
  }

  async execute(topicId: TopicId, version?: number): Promise<TopicVersion> {
    if (version && isNaN(version)) {
      throw new AppError(400, 'Version must be a number')
    }

    if (version) {
      const v = await this.topicVersionRepository.getByTopicAndVersion(topicId, Number(version))
      if (!v) throw new AppError(404, 'Topic version not found')

      return v
    }

    const head = await this.topicRepository.get(topicId)
    if (!head || head.deletedAt) throw new AppError(404, 'Topic not found')

    const latest = await this.topicVersionRepository.getByTopicAndVersion(
      topicId,
      head.latestVersion,
    )
    if (!latest) throw new AppError(404, 'Topic version not found')

    return latest
  }
}
