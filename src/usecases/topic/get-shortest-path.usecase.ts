import { TopicId, TopicVersion } from 'src/models/topic'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { AppError } from 'src/middlewares'

interface PathNode {
  topicId: TopicId
  name: string
}

export class GetShortestPathUseCase {
  constructor(
    private readonly topicVersionRepository: ITopicVersionRepository,
    private readonly topicRepository: ITopicRepository,
  ) {}

  private computeLatestByTopic(versions: TopicVersion[]): Map<string, TopicVersion> {
    const latest = new Map<string, TopicVersion>()
    for (const v of versions) {
      const current = latest.get(v.topicId)
      if (!current || v.version > current.version) latest.set(v.topicId, v)
    }

    return latest
  }

  private buildAdjacency(latestVersions: TopicVersion[]): Map<string, Set<string>> {
    const adjacency = new Map<string, Set<string>>()

    for (const v of latestVersions) {
      if (!adjacency.has(v.topicId)) adjacency.set(v.topicId, new Set<string>())
    }

    for (const v of latestVersions) {
      const parentId = v.parentTopicId
      if (!parentId) continue
      if (!adjacency.has(parentId)) adjacency.set(parentId, new Set<string>())
      adjacency.get(v.topicId)!.add(parentId)
      adjacency.get(parentId)!.add(v.topicId)
    }

    return adjacency
  }

  private reconstructPath(
    fromId: TopicId,
    toId: TopicId,
    predecessor: Map<string, string | null>,
  ): string[] {
    const path: string[] = []
    let cursor: string | null | undefined = toId

    while (cursor) {
      path.push(cursor)
      cursor = predecessor.get(cursor) ?? null
    }

    path.reverse()
    if (path[0] !== fromId) throw new AppError(404, 'Path not found')

    return path
  }

  async execute(fromId: TopicId, toId: TopicId): Promise<{ path: PathNode[] }> {
    if (fromId === toId) {
      const head = await this.topicRepository.get(fromId)
      if (!head || head.deletedAt) throw new AppError(404, 'Topic not found')

      const allVersions = await this.topicVersionRepository.listAll()
      const latestByTopic = this.computeLatestByTopic(allVersions)
      const v = latestByTopic.get(fromId)
      if (!v) throw new AppError(404, 'Topic version not found')

      return { path: [{ topicId: v.topicId, name: v.name }] }
    }

    const [fromHead, toHead] = await Promise.all([
      this.topicRepository.get(fromId),
      this.topicRepository.get(toId),
    ])
    if (!fromHead || fromHead.deletedAt) throw new AppError(404, 'Topic not found')
    if (!toHead || toHead.deletedAt) throw new AppError(404, 'Topic not found')

    const allVersions = await this.topicVersionRepository.listAll()
    const latestByTopic = this.computeLatestByTopic(allVersions)

    const heads = await this.topicRepository.listAll()
    const latestVersions = heads
      .filter((h) => !h.deletedAt)
      .map((h) => latestByTopic.get(h.topicId))
      .filter((v): v is TopicVersion => !!v)

    const adjacency = this.buildAdjacency(latestVersions)

    if (!adjacency.has(fromId) || !adjacency.has(toId)) {
      const fromV = latestByTopic.get(fromId)
      const toV = latestByTopic.get(toId)

      if (!fromV || !toV) throw new AppError(404, 'Topic version not found')
      if (!adjacency.has(fromId)) adjacency.set(fromId, new Set<string>())
      if (!adjacency.has(toId)) adjacency.set(toId, new Set<string>())
    }

    const queue: string[] = [fromId]
    const visited = new Set<string>([fromId])
    const predecessor = new Map<string, string | null>([[fromId, null]])

    while (queue.length > 0) {
      const current = queue.shift() as string
      if (current === toId) break

      const neighbors = adjacency.get(current)
      if (!neighbors) continue

      for (const neighbor of neighbors) {
        if (visited.has(neighbor)) continue
        visited.add(neighbor)
        predecessor.set(neighbor, current)
        queue.push(neighbor)
      }
    }

    if (!predecessor.has(toId)) throw new AppError(404, 'Path not found')

    const idPath = this.reconstructPath(fromId, toId, predecessor)
    const pathNodes: PathNode[] = idPath.map((id) => {
      const v = latestByTopic.get(id)
      if (!v) throw new AppError(404, 'Topic version not found')
      return { topicId: v.topicId, name: v.name }
    })

    return { path: pathNodes }
  }
}
