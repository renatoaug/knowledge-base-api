import request from 'supertest'
import app from 'src/app'
import crypto from 'node:crypto'

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

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app).post('/topics').send({}).expect(400)

    expect(res.body.message).toBe('Validation error')
    expect(res.body.details).toBeTruthy()
  })

  it('returns 400 when name is too short', async () => {
    const res = await request(app)
      .post('/topics')
      .send({ name: '', content: 'c', parentTopicId: crypto.randomUUID() })
      .expect(400)

    expect(res.body.message).toBe('Validation error')
    expect(res.body.details.errors[0].field).toBe('name')
    expect(res.body.details.errors[0].message).toBe(
      'Too small: expected string to have >=1 characters',
    )
  })
})
