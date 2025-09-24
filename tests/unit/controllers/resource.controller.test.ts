import { ResourceController } from 'src/controllers'
import { ResourceType } from 'src/models'
import { ResourceService } from 'src/services'
import type { Request, Response } from 'express'

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

describe('[unit] ResourceController', () => {
  it('create returns 201', async () => {
    const mockService: Partial<ResourceService> = {
      create: jest.fn(async (b) => ({
        id: 'r1',
        topicId: b.topicId,
        url: b.url,
        description: b.description,
        type: b.type,
        createdAt: 1,
        updatedAt: 1,
      })),
    }

    const controller = new ResourceController(mockService as ResourceService)
    const req = {
      body: { topicId: 't1', url: 'https://e', description: 'd', type: ResourceType.LINK },
    } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.create(req, res)

    expect(statusMock).toHaveBeenCalledWith(201)
    expect((jsonMock.mock.calls[0][0] as any).id).toBe('r1')
  })

  it('update returns 200', async () => {
    const mockService: Partial<ResourceService> = {
      update: jest.fn(async () => ({
        id: 'r1',
        topicId: 't1',
        url: 'https://e',
        description: 'x',
        type: ResourceType.LINK,
        createdAt: 1,
        updatedAt: 2,
      })),
    }
    const controller = new ResourceController(mockService as ResourceService)

    const req = { params: { id: 'r1' }, body: { description: 'x' } } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()
    await controller.update(req, res)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect((jsonMock.mock.calls[0][0] as any).description).toBe('x')
  })

  it('delete returns 204', async () => {
    const mockService: Partial<ResourceService> = { delete: jest.fn(async () => {}) }
    const controller = new ResourceController(mockService as ResourceService)

    const req = { params: { id: 'r1' } } as unknown as Request
    const { res, statusMock, endMock } = createMockResponse()

    await controller.delete(req, res)

    expect(statusMock).toHaveBeenCalledWith(204)
    expect(endMock).toHaveBeenCalled()
  })

  it('get returns 200', async () => {
    const mockService: Partial<ResourceService> = {
      get: jest.fn(async () => ({
        id: 'r1',
        topicId: 't1',
        url: 'https://e',
        description: 'd',
        type: ResourceType.LINK,
        createdAt: 1,
        updatedAt: 1,
      })),
    }
    const controller = new ResourceController(mockService as ResourceService)

    const req = { params: { id: 'r1' } } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.get(req, res)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect((jsonMock.mock.calls[0][0] as any).id).toBe('r1')
  })

  it('listByTopic returns 200', async () => {
    const mockService: Partial<ResourceService> = {
      listByTopic: jest.fn(async () => [
        {
          id: 'r1',
          topicId: 't1',
          url: 'https://e',
          description: 'd',
          type: ResourceType.LINK,
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    }
    const controller = new ResourceController(mockService as ResourceService)

    const req = { params: { topicId: 't1' } } as unknown as Request
    const { res, statusMock, jsonMock } = createMockResponse()

    await controller.listByTopic(req, res)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect((jsonMock.mock.calls[0][0] as any).length).toBe(1)
  })
})
