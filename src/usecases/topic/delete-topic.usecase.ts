import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository, IResourceRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'
import { TopicVersionFactory } from 'src/usecases/topic'
import { UseCase } from 'src/usecases'

export class DeleteTopicUseCase extends UseCase<
  { topicId: TopicId; performedByUserId: string },
  void
> {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
    private readonly resourceRepository: IResourceRepository,
  ) {
    super()
  }

  async execute({
    topicId,
    performedByUserId,
  }: {
    topicId: TopicId
    performedByUserId: string
  }): Promise<void> {
    await this.deleteTopicRecursively(topicId, performedByUserId)
  }

  private async deleteTopicRecursively(topicId: TopicId, performedByUserId: string): Promise<void> {
    const head = await this.topicRepository.get(topicId)
    if (!head) throw new AppError(404, 'Topic not found')

    if (head.deletedAt) throw new AppError(404, 'Topic not found')

    const current = await this.topicVersionRepository.getByTopicAndVersion(
      topicId,
      head.latestVersion,
    )
    if (!current) throw new AppError(404, 'Topic version not found')

    const children = await this.topicRepository.findChildren(topicId)
    for (const child of children) {
      await this.deleteTopicRecursively(child.topicId, performedByUserId)
    }

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
    await this.resourceRepository.deleteByTopic(topicId)
  }
}
