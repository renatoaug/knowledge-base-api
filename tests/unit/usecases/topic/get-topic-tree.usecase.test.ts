import { GetTopicTreeUseCase, TopicTreeNode } from 'src/usecases/topic/get-topic-tree.usecase'
import { Topic, TopicVersion, TopicAction } from 'src/models'
import { ITopicRepository, ITopicVersionRepository } from 'src/repositories'

describe('[unit] GetTopicTreeUseCase', () => {
  it('builds tree from root with children', async () => {
    const rootId = 'root'
    const heads: Topic[] = [
      { topicId: rootId, latestVersion: 1, deletedAt: null },
      { topicId: 'child-1', latestVersion: 1, deletedAt: null },
      { topicId: 'child-2', latestVersion: 1, deletedAt: null },
      { topicId: 'grandchild-1', latestVersion: 1, deletedAt: null },
    ]

    const versions: TopicVersion[] = [
      {
        id: 'root-1',
        topicId: rootId,
        version: 1,
        name: 'Root',
        content: 'c',
        parentTopicId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        action: TopicAction.CREATE,
        performedBy: 'u-editor',
      },
      {
        id: 'child-1',
        topicId: 'child-1',
        version: 1,
        name: 'Child 1',
        content: 'c',
        parentTopicId: rootId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        action: TopicAction.CREATE,
        performedBy: 'u-editor',
      },
      {
        id: 'child-2',
        topicId: 'child-2',
        version: 1,
        name: 'Child 2',
        content: 'c',
        parentTopicId: rootId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        action: TopicAction.CREATE,
        performedBy: 'u-editor',
      },
      {
        id: 'grandchild-1',
        topicId: 'grandchild-1',
        version: 1,
        name: 'Grandchild 1',
        content: 'c',
        parentTopicId: 'child-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        action: TopicAction.CREATE,
        performedBy: 'u-editor',
      },
    ]

    const topicVersionRepository: ITopicVersionRepository = {
      append: jest.fn(),
      listAll: jest.fn(async () => versions),
      getByTopicAndVersion: jest.fn(),
    } as any

    const topicRepository: ITopicRepository = {
      get: jest.fn(async (id: string) => heads.find((h) => h.topicId === id)),
      listAll: jest.fn(async () => heads),
      upsert: jest.fn(),
    } as any

    const uc = new GetTopicTreeUseCase(topicVersionRepository, topicRepository)
    const tree = (await uc.execute(rootId)) as TopicTreeNode

    expect(tree).toEqual({
      topicId: 'root',
      name: 'Root',
      children: [
        {
          topicId: 'child-1',
          name: 'Child 1',
          children: [
            {
              topicId: 'grandchild-1',
              name: 'Grandchild 1',
              children: [],
            },
          ],
        },
        {
          topicId: 'child-2',
          name: 'Child 2',
          children: [],
        },
      ],
    })
  })
})
