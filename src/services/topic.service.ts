import { TopicId, TopicVersion } from 'src/models'
import { User } from 'src/models/user'
import { ITopicRepository, ITopicVersionRepository, IResourceRepository } from 'src/repositories'
import {
  CreateTopicUseCase,
  UpdateTopicUseCase,
  DeleteTopicUseCase,
  GetTopicUseCase,
  GetTopicTreeUseCase,
  GetShortestPathUseCase,
} from 'src/usecases/topic'
import { TopicTreeNode } from 'src/models/topic'

export interface CreateTopicInput {
  name: string
  content: string
  parentTopicId?: TopicId | null
}

export interface UpdateTopicInput {
  name?: string
  content?: string
  parentTopicId?: TopicId | null
}

export class TopicService {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
    private readonly resourceRepository: IResourceRepository,
  ) {}

  async create(input: CreateTopicInput, user: User): Promise<TopicVersion> {
    const uc = new CreateTopicUseCase(this.topicVersionRepository, this.topicRepository)
    return uc.execute({ input, performedByUserId: user.id })
  }

  async update(topicId: TopicId, input: UpdateTopicInput, user: User): Promise<TopicVersion> {
    const uc = new UpdateTopicUseCase(this.topicVersionRepository, this.topicRepository)
    return uc.execute({ topicId, input, performedByUserId: user.id })
  }

  async delete(topicId: TopicId, user: User): Promise<void> {
    const uc = new DeleteTopicUseCase(
      this.topicVersionRepository,
      this.topicRepository,
      this.resourceRepository,
    )
    await uc.execute({ topicId, performedByUserId: user.id })
  }

  async get(topicId: TopicId, version?: number): Promise<TopicVersion> {
    const uc = new GetTopicUseCase(this.topicVersionRepository, this.topicRepository)
    return uc.execute(topicId, version)
  }

  async getTree(topicId: TopicId): Promise<TopicTreeNode> {
    const uc = new GetTopicTreeUseCase(this.topicVersionRepository, this.topicRepository)
    return uc.execute(topicId)
  }

  async getShortestPath(
    fromId: TopicId,
    toId: TopicId,
  ): Promise<{ path: { topicId: TopicId; name: string }[] }> {
    const uc = new GetShortestPathUseCase(this.topicVersionRepository, this.topicRepository)
    return uc.execute({ fromId, toId })
  }
}
