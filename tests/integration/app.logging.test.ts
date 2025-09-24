import request from 'supertest'
import app from 'src/app'

describe('[integration] app logging', () => {
  it('GET /health returns 200 (info path)', async () => {
    await request(app).get('/health').expect(200)
  })

  it('POST /topics with viewer-token returns 403 (warn path)', async () => {
    await request(app)
      .post('/topics')
      .set('Authorization', 'Bearer viewer-token')
      .send({ name: 'x', content: 'c', parentTopicId: null })
      .expect(403)
  })

  it('GET /topics/shortest-path with invalid query returns 400 (warn path)', async () => {
    await request(app)
      .get('/topics/shortest_path?from=not-uuid&to=also-not-uuid')
      .set('Authorization', 'Bearer viewer-token')
      .expect(400)
  })
})
