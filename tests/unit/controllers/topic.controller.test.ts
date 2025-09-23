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
