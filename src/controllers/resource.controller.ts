import { Request, Response } from 'express'
import { ResourceService } from 'src/services'

export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const created = await this.service.create(req.body)
    res.status(201).json(created)
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.service.update(req.params.id, req.body)
    res.status(200).json(updated)
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id)
    res.status(204).end()
  }

  get = async (req: Request, res: Response): Promise<void> => {
    const found = await this.service.get(req.params.id)
    res.status(200).json(found)
  }

  listByTopic = async (req: Request, res: Response): Promise<void> => {
    const list = await this.service.listByTopic(req.params.topicId)
    res.status(200).json(list)
  }
}
