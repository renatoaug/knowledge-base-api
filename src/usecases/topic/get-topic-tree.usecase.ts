import { TopicId, TopicVersion } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

export interface TopicTreeNode {
  topicId: TopicId
  name: string
  children: TopicTreeNode[]
}

export class GetTopicTreeUseCase {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {}

  private computeLatestByTopic(versions: TopicVersion[]): Map<string, TopicVersion> {
    const latest = new Map<string, TopicVersion>()

    for (const v of versions) {
      const cur = latest.get(v.topicId)
      if (!cur || v.version > cur.version) latest.set(v.topicId, v)
    }

    return latest
  }

  private buildChildrenIndex(latestVersions: TopicVersion[]): Map<string, TopicVersion[]> {
    const index = new Map<string, TopicVersion[]>()

    for (const v of latestVersions) {
      const parentId = v.parentTopicId
      if (!parentId) continue

      const list = index.get(parentId) ?? []

      list.push(v)
      index.set(parentId, list)
    }

    return index
  }

  private toNode(v: TopicVersion): TopicTreeNode {
    return { topicId: v.topicId, name: v.name, children: [] }
  }

  async execute(rootId: TopicId): Promise<TopicTreeNode> {
    const target = await this.topicRepository.get(rootId)
    if (!target || target.deletedAt) throw new AppError(404, 'Topic not found')

    const allVersions = await this.topicVersionRepository.listAll()
    const latestByTopic = this.computeLatestByTopic(allVersions)
    const heads = await this.topicRepository.listAll()
    const latestVersions = heads
      .filter((h) => !h.deletedAt)
      .map((h) => latestByTopic.get(h.topicId))
      .filter((v): v is TopicVersion => !!v)

    const index = this.buildChildrenIndex(latestVersions)

    const rootLatest = latestByTopic.get(target.topicId)
    if (!rootLatest) throw new AppError(404, 'Topic version not found')

    const rootNode = this.toNode(rootLatest)
    const stack: TopicTreeNode[] = [rootNode]

    while (stack.length > 0) {
      const node = stack.pop() as TopicTreeNode
      const children = index.get(node.topicId) ?? []

      for (const child of children) {
        const childNode = this.toNode(child)
        node.children.push(childNode)
        stack.push(childNode)
      }
    }

    return rootNode
  }
}
