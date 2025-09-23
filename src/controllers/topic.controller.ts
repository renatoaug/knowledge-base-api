import { Request, Response } from 'express'
import { TopicService } from 'src/services'

export class TopicController {
  constructor(private readonly service: TopicService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const created = await this.service.create(req.body)
    res.status(201).json(created)
  }
}
