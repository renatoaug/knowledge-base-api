import crypto from 'node:crypto'
import { TopicAction, TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

export interface CreateTopicInput {
  name: string
  content: string
  parentTopicId?: TopicId | null
}

export class CreateTopicUseCase {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {}

  async execute(input: CreateTopicInput, performedByUserId: string): Promise<TopicVersion> {
    const now = Date.now()
    const topicId = crypto.randomUUID()
    const version: TopicVersion = {
      id: crypto.randomUUID(),
      topicId,
      version: 1,
      name: input.name,
      content: input.content,
      parentTopicId: input.parentTopicId ?? null,
      createdAt: now,
      updatedAt: now,
      action: TopicAction.CREATE,
      performedBy: performedByUserId,
    }

    await this.topicVersionRepository.append(version)
    await this.topicRepository.upsert({ topicId, latestVersion: 1, deletedAt: null })

    return version
  }
}
