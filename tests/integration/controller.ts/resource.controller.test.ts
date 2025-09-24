import request from 'supertest'
import app from 'src/app'
import crypto from 'node:crypto'
import { ResourceType } from 'src/models'

describe('[integration] Resources', () => {
  describe('POST /resources', () => {
    it('401 when no Authorization header', async () => {
      await request(app).post('/resources').send({}).expect(401)
    })

    it('400 when invalid body', async () => {
      await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({})
        .expect(400)
    })

    it('404 when topic not found', async () => {
      await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({ topicId: crypto.randomUUID(), url: 'https://e', description: 'd', type: 'link' })
        .expect(404)
    })

    it('403 when viewer tries to create', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer viewer-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(403)
    })

    it('201 creates a resource', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const res = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      expect(res.body.topicId).toBe(topic.body.topicId)
      expect(res.body.url).toBe('https://e.com')
    })
  })

  describe('GET /resources/:id', () => {
    it('401 when no Authorization header', async () => {
      await request(app).get(`/resources/${crypto.randomUUID()}`).expect(401)
    })

    it('404 when resource not found', async () => {
      await request(app)
        .get(`/resources/${crypto.randomUUID()}`)
        .set('Authorization', 'Bearer viewer-token')
        .expect(404)
    })

    it('200 returns resource', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      const res = await request(app)
        .get(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer viewer-token')
        .expect(200)

      expect(res.body.id).toBe(created.body.id)
    })
  })

  describe('PUT /resources/:id', () => {
    it('401 when no Authorization header', async () => {
      await request(app).put(`/resources/${crypto.randomUUID()}`).send({}).expect(401)
    })

    it('400 when invalid body', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://valid.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      await request(app)
        .put(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer editor-token')
        .send({ url: 'not-a-url' })
        .expect(400)
    })

    it('404 when resource not found', async () => {
      await request(app)
        .put(`/resources/${crypto.randomUUID()}`)
        .set('Authorization', 'Bearer editor-token')
        .send({ description: 'x' })
        .expect(404)
    })

    it('403 when viewer tries to update', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      await request(app)
        .put(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer viewer-token')
        .send({ description: 'x' })
        .expect(403)
    })

    it('200 updates', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      const res = await request(app)
        .put(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer editor-token')
        .send({ description: 'x' })
        .expect(200)

      expect(res.body.description).toBe('x')
    })
  })

  describe('DELETE /resources/:id', () => {
    it('401 when no Authorization header', async () => {
      await request(app).delete(`/resources/${crypto.randomUUID()}`).expect(401)
    })

    it('404 when resource not found', async () => {
      await request(app)
        .delete(`/resources/${crypto.randomUUID()}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(404)
    })

    it('403 when editor tries to delete', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      await request(app)
        .delete(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer editor-token')
        .expect(403)
    })

    it('403 when viewer tries to delete', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      await request(app)
        .delete(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer viewer-token')
        .expect(403)
    })

    it('204 deletes', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      const created = await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      await request(app)
        .delete(`/resources/${created.body.id}`)
        .set('Authorization', 'Bearer admin-token')
        .expect(204)
    })
  })

  describe('GET /topics/:id/resources', () => {
    it('401 when no Authorization header', async () => {
      await request(app).get(`/topics/${crypto.randomUUID()}/resources`).expect(401)
    })

    it('400 when topicId is not uuid', async () => {
      await request(app)
        .get(`/topics/not-uuid/resources`)
        .set('Authorization', 'Bearer viewer-token')
        .expect(400)
    })

    it('200 lists by topic', async () => {
      const topic = await request(app)
        .post('/topics')
        .set('Authorization', 'Bearer editor-token')
        .send({ name: 'Root', content: 'c', parentTopicId: null })
        .expect(201)

      await request(app)
        .post('/resources')
        .set('Authorization', 'Bearer editor-token')
        .send({
          topicId: topic.body.topicId,
          url: 'https://e.com',
          description: 'd',
          type: ResourceType.LINK,
        })
        .expect(201)

      const res = await request(app)
        .get(`/topics/${topic.body.topicId}/resources`)
        .set('Authorization', 'Bearer viewer-token')
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(1)
    })
  })
})
