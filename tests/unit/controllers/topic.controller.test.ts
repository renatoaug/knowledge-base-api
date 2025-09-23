import { TopicController } from 'src/controllers'
import { TopicAction, TopicVersion } from 'src/models'
import type { Request, Response } from 'express'
import { TopicService } from 'src/services'
import crypto from 'node:crypto'

function createMockResponse(): {
  res: Response
  statusMock: jest.Mock
  jsonMock: jest.Mock
  endMock: jest.Mock
} {
  const partial: Partial<Response> = {}
  const statusMock = jest.fn().mockReturnValue(partial)
  const jsonMock = jest.fn().mockReturnValue(partial)
  const endMock = jest.fn().mockReturnValue(partial)
  partial.status = statusMock as unknown as Response['status']
  partial.json = jsonMock as unknown as Response['json']
  partial.end = endMock as unknown as Response['end']
  return { res: partial as Response, statusMock, jsonMock, endMock }
}

describe('[unit] TopicController - create', () => {
  it('returns 201 with created topic', async () => {
    const mockService: Partial<TopicService> = {
      create: jest.fn(async () => ({
        id: crypto.randomUUID(),
        topicId: 't1',
        version: 1,
        name: 'Root',
        content: 'c',
        parentTopicId: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        action: TopicAction.CREATE,
        performedBy: 'userId',
      })),
    }

    const controller = new TopicController(mockService as unknown as TopicService)

    const req = { body: { name: 'Root', content: 'c', parentTopicId: null } } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.create(req, res)

    expect((mockService.create as jest.Mock).mock.calls[0][0]).toEqual({
      name: 'Root',
      content: 'c',
      parentTopicId: null,
    })
    expect(statusMock.mock.calls[0][0]).toBe(201)
    expect((jsonMock.mock.calls[0][0] as TopicVersion).name).toBe('Root')
    expect((jsonMock.mock.calls[0][0] as TopicVersion).version).toBe(1)
  })
})

describe('[unit] TopicController - update', () => {
  it('returns 200 with updated topic', async () => {
    const versionId = crypto.randomUUID()
    const mockService: Partial<TopicService> = {
      update: jest.fn(
        async () =>
          ({
            id: versionId,
            topicId: 't1',
            version: 2,
            name: 'Root',
            content: 'c2',
            parentTopicId: null,
            createdAt: Date.now() - 1000,
            updatedAt: Date.now(),
            action: TopicAction.UPDATE,
            performedBy: 'u-editor',
          }) as TopicVersion,
      ),
    }

    const controller = new TopicController(mockService as unknown as TopicService)

    const req = { params: { id: 't1' }, body: { content: 'c2' } } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.update(req, res)

    expect(statusMock).toHaveBeenCalledWith(200)
    const body = jsonMock.mock.calls[0][0] as any
    expect(body.versionId).toBe(versionId)
    expect(body.id).toBeUndefined()
  })
})

describe('[unit] TopicController - delete', () => {
  it('returns 204', async () => {
    const mockService: Partial<TopicService> = {
      delete: jest.fn(async () => {}),
    }

    const controller = new TopicController(mockService as unknown as TopicService)

    const req = { params: { id: 't1' } } as unknown as Request
    const { res, statusMock } = createMockResponse()

    await controller.delete(req, res)

    expect(statusMock).toHaveBeenCalledWith(204)
  })
})

describe('[unit] TopicController - get', () => {
  it('returns 200 with topic', async () => {
    const versionId = crypto.randomUUID()
    const mockService: Partial<TopicService> = {
      get: jest.fn(
        async () =>
          ({
            id: versionId,
            topicId: 't1',
            version: 2,
            name: 'Root',
            content: 'c2',
            parentTopicId: null,
            createdAt: Date.now() - 1000,
            updatedAt: Date.now(),
            action: TopicAction.UPDATE,
            performedBy: 'u-editor',
          }) as TopicVersion,
      ),
    }

    const controller = new TopicController(mockService as unknown as TopicService)

    const req = { params: { id: 't1' }, query: {} } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.get(req, res)

    expect(statusMock).toHaveBeenCalledWith(200)
    const body = jsonMock.mock.calls[0][0] as any
    expect(body.versionId).toBe(versionId)
    expect(body.id).toBeUndefined()
  })
})
