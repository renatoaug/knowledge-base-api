import { TopicVersionFactory } from 'src/usecases/topic'
import { TopicAction } from 'src/models/topic'

describe('[unit] TopicVersionFactory', () => {
  it('creates create version with now and performedBy', () => {
    const now = 123
    const v = TopicVersionFactory.fromCreate(
      't',
      { name: 'N', content: 'C', parentTopicId: null },
      now,
      'u',
    )
    expect(v.topicId).toBe('t')
    expect(v.version).toBe(1)
    expect(v.name).toBe('N')
    expect(v.content).toBe('C')
    expect(v.action).toBe(TopicAction.CREATE)
    expect(v.createdAt).toBe(now)
    expect(v.updatedAt).toBe(now)
    expect(v.performedBy).toBe('u')
  })

  it('creates update version merging previous and input', () => {
    const prev = {
      id: 'v1',
      topicId: 't',
      version: 1,
      name: 'N',
      content: 'C',
      parentTopicId: 'p',
      createdAt: 1,
      updatedAt: 1,
      action: TopicAction.CREATE,
      performedBy: 'u',
    }
    const v = TopicVersionFactory.fromUpdate(
      't',
      2,
      prev,
      { content: 'C2', parentTopicId: null },
      200,
      'u2',
    )
    expect(v.version).toBe(2)
    expect(v.name).toBe('N')
    expect(v.content).toBe('C2')
    expect(v.parentTopicId).toBeNull()
    expect(v.createdAt).toBe(prev.createdAt)
    expect(v.updatedAt).toBe(200)
    expect(v.action).toBe(TopicAction.UPDATE)
    expect(v.performedBy).toBe('u2')
  })

  it('creates delete (tombstone) version from previous', () => {
    const prev = {
      id: 'v1',
      topicId: 't',
      version: 1,
      name: 'N',
      content: 'C',
      parentTopicId: null,
      createdAt: 1,
      updatedAt: 1,
      action: TopicAction.CREATE,
      performedBy: 'u',
    }
    const v = TopicVersionFactory.fromDelete('t', 2, prev, 300, 'admin')
    expect(v.version).toBe(2)
    expect(v.name).toBe('N')
    expect(v.content).toBe('C')
    expect(v.action).toBe(TopicAction.DELETE)
    expect(v.updatedAt).toBe(300)
    expect(v.performedBy).toBe('admin')
  })
})
