import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { TopicVersionFactory } from 'src/usecases/topic'

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
    const topicId = (await import('node:crypto')).randomUUID()
    const version = TopicVersionFactory.fromCreate(
      topicId,
      { name: input.name, content: input.content, parentTopicId: input.parentTopicId ?? null },
      now,
      performedByUserId,
    )

    await this.topicVersionRepository.append(version)
    await this.topicRepository.upsert({ topicId, latestVersion: 1, deletedAt: null })

    return version
  }
}
