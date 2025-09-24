import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'
import { TopicVersionFactory } from 'src/usecases/topic'
import { UseCase } from 'src/usecases'

export interface UpdateTopicInput {
  name?: string
  content?: string
  parentTopicId?: TopicId | null
}

export class UpdateTopicUseCase extends UseCase<
  { topicId: TopicId; input: UpdateTopicInput; performedByUserId: string },
  TopicVersion
> {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {
    super()
  }

  async execute({
    topicId,
    input,
    performedByUserId,
  }: {
    topicId: TopicId
    input: UpdateTopicInput
    performedByUserId: string
  }): Promise<TopicVersion> {
    const head = await this.topicRepository.get(topicId)
    if (!head || head.deletedAt) throw new AppError(404, 'Topic not found')

    const current = await this.topicVersionRepository.getByTopicAndVersion(
      topicId,
      head.latestVersion,
    )
    if (!current) throw new AppError(404, 'Topic version not found')

    if (input.parentTopicId) {
      const parentTopic = await this.topicRepository.get(input.parentTopicId)
      if (!parentTopic || parentTopic.deletedAt) {
        throw new AppError(400, 'Parent topic not found')
      }
    }

    const now = Date.now()
    const nextVersionNumber = head.latestVersion + 1
    const next: TopicVersion = TopicVersionFactory.fromUpdate(
      topicId,
      nextVersionNumber,
      current,
      {
        name: input.name ?? undefined,
        content: input.content ?? undefined,
        parentTopicId:
          input.parentTopicId === undefined ? undefined : (input.parentTopicId ?? null),
      },
      now,
      performedByUserId,
    )

    await this.topicVersionRepository.append(next)
    await this.topicRepository.upsert({
      topicId,
      latestVersion: nextVersionNumber,
      deletedAt: null,
    })

    return next
  }
}
