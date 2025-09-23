import request from 'supertest'
import app from 'src/app'
import crypto from 'node:crypto'

describe('[integration] POST /topics', () => {
  it('returns 201 and the created topic version payload', async () => {
    const res = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer editor-token')
      .send({ name: 'Root', content: 'c', parentTopicId: null })
      .expect(201)

    const body = res.body
    expect(typeof body.versionId).toBe('string')
    expect(typeof body.topicId).toBe('string')
    expect(body.version).toBe(1)
    expect(body.name).toBe('Root')
    expect(body.content).toBe('c')
    expect(body.parentTopicId).toBeNull()
    expect(typeof body.createdAt).toBe('number')
    expect(body.updatedAt).toBe(body.createdAt)
    expect(body.action).toBe('create')
    expect(body.performedBy).toBe('u-editor')
  })

  it('returns 400 when body is missing required fields', async () => {
    const res = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer editor-token')
      .send({})
      .expect(400)

    expect(res.body.message).toBe('Validation error')
    expect(res.body.details).toBeTruthy()
  })

  it('returns 400 when name is too short', async () => {
    const res = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer editor-token')
      .send({ name: '', content: 'c', parentTopicId: crypto.randomUUID() })
      .expect(400)

    expect(res.body.message).toBe('Validation error')
    expect(res.body.details.errors[0].field).toBe('name')
    expect(res.body.details.errors[0].message).toBe(
      'Too small: expected string to have >=1 characters',
    )
  })

  it('returns 403 when user is a viewer', async () => {
    const res = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer viewer-token')
      .send({ name: 'Root', content: 'c', parentTopicId: crypto.randomUUID() })
      .expect(403)

    expect(res.body.message).toBe('Forbidden')
  })
})

describe('[integration] PUT /topics/:id', () => {
  it('updates topic and creates new version', async () => {
    const create = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer editor-token')
      .send({ name: 'Root', content: 'c', parentTopicId: null })
      .expect(201)

    const topicId = create.body.topicId

    const update = await request(app)
      .put(`/topics/${topicId}`)
      .set('Authorization', 'Bearer editor-token')
      .send({ content: 'c2' })
      .expect(200)

    expect(update.body.version).toBe(2)
    expect(update.body.content).toBe('c2')
    expect(update.body.performedBy).toBe('u-editor')
  })
})

describe('[integration] DELETE /topics/:id', () => {
  it.each([
    ['admin-token', 204],
    ['editor-token', 403],
    ['viewer-token', 403],
  ])('with %s should return %s', async (token, expected) => {
    const create = await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer admin-token')
      .send({ name: 'Root', content: 'c', parentTopicId: null })
      .expect(201)

    const topicId = create.body.topicId

    await request(app)
      .delete(`/topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(expected)
  })
})
