import request from 'supertest'
import app from 'src/app'

describe('[integration] POST /topics', () => {
  it('returns 201 and the created topic version payload', async () => {
    const res = await request(app)
      .post('/topics')
      .send({ name: 'Root', content: 'c', parentTopicId: null })
      .expect(201)

    const body = res.body
    expect(typeof body.id).toBe('string')
    expect(typeof body.topicId).toBe('string')
    expect(body.version).toBe(1)
    expect(body.name).toBe('Root')
    expect(body.content).toBe('c')
    expect(body.parentTopicId).toBeNull()
    expect(typeof body.createdAt).toBe('number')
    expect(body.updatedAt).toBe(body.createdAt)
    expect(body.action).toBe('create')
    expect(body.performedBy).toBe('userId')
  })
})
