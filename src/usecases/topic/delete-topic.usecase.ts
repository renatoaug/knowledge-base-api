import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'
import { TopicVersionFactory } from 'src/usecases/topic'

export class DeleteTopicUseCase {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {}

  async execute(topicId: TopicId, performedByUserId: string): Promise<void> {
    const head = await this.topicRepository.get(topicId)
    if (!head) throw new AppError(404, 'Topic not found')

    if (head.deletedAt) throw new AppError(404, 'Topic not found')

    const current = await this.topicVersionRepository.getByTopicAndVersion(
      topicId,
      head.latestVersion,
    )
    if (!current) throw new AppError(404, 'Topic version not found')

    const now = Date.now()
    const nextVersionNumber = head.latestVersion + 1
    const tombstone: TopicVersion = TopicVersionFactory.fromDelete(
      topicId,
      nextVersionNumber,
      current,
      now,
      performedByUserId,
    )

    await this.topicVersionRepository.append(tombstone)
    await this.topicRepository.upsert({ topicId, latestVersion: nextVersionNumber, deletedAt: now })
  }
}
