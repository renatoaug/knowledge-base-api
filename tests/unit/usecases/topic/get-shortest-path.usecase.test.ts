import { GetShortestPathUseCase } from 'src/usecases/topic'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'
import { Topic, TopicAction, TopicVersion } from 'src/models/topic'
import { AppError } from 'src/middlewares'

describe('[unit] GetShortestPathUseCase', () => {
  const makeRepos = (versions: TopicVersion[], heads: Topic[]) => {
    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      getByTopicAndVersion: jest.fn(),
      listAll: jest.fn().mockResolvedValue(versions),
    }
    const topicRepository: ITopicRepository = {
      upsert: jest.fn(),
      get: jest.fn(async (id) => heads.find((h) => h.topicId === id)),
      listAll: jest.fn().mockResolvedValue(heads),
    }
    return { topicVersionRepository, topicRepository }
  }

  it('returns path from root -> child -> grandchild', async () => {
    const rootId = 'r'
    const childId = 'c'
    const grandId = 'g'
    const heads: Topic[] = [
      { topicId: rootId, latestVersion: 1, deletedAt: null },
      { topicId: childId, latestVersion: 1, deletedAt: null },
      { topicId: grandId, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = [
      {
        id: 'v1',
        topicId: rootId,
        version: 1,
        name: 'Root',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'v2',
        topicId: childId,
        version: 1,
        name: 'Child',
        content: 'c',
        parentTopicId: rootId,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'v3',
        topicId: grandId,
        version: 1,
        name: 'Grand',
        content: 'c',
        parentTopicId: childId,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)

    const res = await uc.execute(rootId, grandId)
    expect(res.path.map((p) => p.topicId)).toEqual([rootId, childId, grandId])
    expect(res.path.map((p) => p.name)).toEqual(['Root', 'Child', 'Grand'])
  })

  it('returns 404 when no connection', async () => {
    const a = 'a'
    const b = 'b'
    const heads: Topic[] = [
      { topicId: a, latestVersion: 1, deletedAt: null },
      { topicId: b, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = [
      {
        id: 'v1',
        topicId: a,
        version: 1,
        name: 'A',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'v2',
        topicId: b,
        version: 1,
        name: 'B',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)

    await expect(uc.execute(a, b)).rejects.toMatchObject({ message: 'Path not found' })
  })

  it('returns single node path when from===to', async () => {
    const a = 'a'
    const heads: Topic[] = [{ topicId: a, latestVersion: 1, deletedAt: null }]
    const versions: TopicVersion[] = [
      {
        id: 'v1',
        topicId: a,
        version: 1,
        name: 'A',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)

    const res = await uc.execute(a, a)
    expect(res.path).toEqual([{ topicId: a, name: 'A' }])
  })

  it('throws 404 when from or to topic not found', async () => {
    const heads: Topic[] = []
    const versions: TopicVersion[] = []
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    await expect(uc.execute('x', 'y')).rejects.toBeInstanceOf(AppError)
  })

  it('throws 404 Topic version not found when from===to but latest version is missing', async () => {
    const a = 'a'
    const heads: Topic[] = [{ topicId: a, latestVersion: 1, deletedAt: null }]
    const versions: TopicVersion[] = []
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    await expect(uc.execute(a, a)).rejects.toMatchObject({ message: 'Topic version not found' })
  })

  it('throws 404 Topic version not found when one of the latest versions is missing (from!=to)', async () => {
    const a = 'a'
    const b = 'b'
    const heads: Topic[] = [
      { topicId: a, latestVersion: 1, deletedAt: null },
      { topicId: b, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = [
      {
        id: 'va1',
        topicId: a,
        version: 1,
        name: 'A',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    await expect(uc.execute(a, b)).rejects.toMatchObject({ message: 'Topic version not found' })
  })

  it('throws 404 Topic not found when from head is deleted', async () => {
    const a = 'a'
    const b = 'b'
    const heads: Topic[] = [
      { topicId: a, latestVersion: 1, deletedAt: 123 },
      { topicId: b, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = []
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    await expect(uc.execute(a, b)).rejects.toMatchObject({ message: 'Topic not found' })
  })

  it('uses latest versions (renamed nodes and updated parents) to build path and labels', async () => {
    const r = 'r'
    const b = 'b'
    const c = 'c'
    const f = 'f'
    const heads: Topic[] = [
      { topicId: r, latestVersion: 1, deletedAt: null },
      { topicId: b, latestVersion: 2, deletedAt: null },
      { topicId: c, latestVersion: 2, deletedAt: null },
      { topicId: f, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = [
      {
        id: 'vr1',
        topicId: r,
        version: 1,
        name: 'R',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'vb1',
        topicId: b,
        version: 1,
        name: 'B',
        content: 'c',
        parentTopicId: r,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'vb2',
        topicId: b,
        version: 2,
        name: 'B2',
        content: 'c',
        parentTopicId: r,
        createdAt: 1,
        updatedAt: 2,
        action: TopicAction.UPDATE,
        performedBy: 'u',
      },
      {
        id: 'vc1',
        topicId: c,
        version: 1,
        name: 'C',
        content: 'c',
        parentTopicId: r,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'vc2',
        topicId: c,
        version: 2,
        name: 'C2',
        content: 'c',
        parentTopicId: r,
        createdAt: 1,
        updatedAt: 2,
        action: TopicAction.UPDATE,
        performedBy: 'u',
      },
      {
        id: 'vf1',
        topicId: f,
        version: 1,
        name: 'F',
        content: 'c',
        parentTopicId: c,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute(b, f)
    expect(res.path.map((p) => p.topicId)).toEqual([b, r, c, f])
    expect(res.path.map((p) => p.name)).toEqual(['B2', 'R', 'C2', 'F'])
  })

  it('treats edges as undirected (child to parent)', async () => {
    const r = 'r'
    const b = 'b'
    const heads: Topic[] = [
      { topicId: r, latestVersion: 1, deletedAt: null },
      { topicId: b, latestVersion: 1, deletedAt: null },
    ]
    const versions: TopicVersion[] = [
      {
        id: 'vr1',
        topicId: r,
        version: 1,
        name: 'R',
        content: 'c',
        parentTopicId: null,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
      {
        id: 'vb1',
        topicId: b,
        version: 1,
        name: 'B',
        content: 'c',
        parentTopicId: r,
        createdAt: 1,
        updatedAt: 1,
        action: TopicAction.CREATE,
        performedBy: 'u',
      },
    ]
    const { topicVersionRepository, topicRepository } = makeRepos(versions, heads)
    const uc = new GetShortestPathUseCase(topicVersionRepository, topicRepository)
    const res = await uc.execute(b, r)
    expect(res.path.map((p) => p.topicId)).toEqual([b, r])
    expect(res.path.map((p) => p.name)).toEqual(['B', 'R'])
  })
})
