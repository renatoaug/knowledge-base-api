import crypto from 'node:crypto'
import { TopicAction, TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

export interface UpdateTopicInput {
  name?: string
  content?: string
  parentTopicId?: TopicId | null
}

export class UpdateTopicUseCase {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {}

  async execute(
    topicId: TopicId,
    input: UpdateTopicInput,
    performedByUserId: string,
  ): Promise<TopicVersion> {
    const head = await this.topicRepository.get(topicId)
    if (!head || head.deletedAt) throw new AppError(404, 'Topic not found')

    const current = await this.topicVersionRepository.getByTopicAndVersion(
      topicId,
      head.latestVersion,
    )
    if (!current) throw new AppError(404, 'Topic version not found')

    const now = Date.now()
    const nextVersionNumber = head.latestVersion + 1
    const next: TopicVersion = {
      id: crypto.randomUUID(),
      topicId,
      version: nextVersionNumber,
      name: input.name ?? current.name,
      content: input.content ?? current.content,
      parentTopicId:
        input.parentTopicId === undefined ? current.parentTopicId : input.parentTopicId,
      createdAt: current.createdAt,
      updatedAt: now,
      action: TopicAction.UPDATE,
      performedBy: performedByUserId,
    }

    await this.topicVersionRepository.append(next)
    await this.topicRepository.upsert({
      topicId,
      latestVersion: nextVersionNumber,
      deletedAt: null,
    })

    return next
  }
}
