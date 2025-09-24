import { Request, Response } from 'express'
import { TopicService } from 'src/services'
import { TopicVersion } from 'src/models'

export class TopicController {
  constructor(private readonly service: TopicService) {}

  private toResponse(version: TopicVersion): Omit<TopicVersion, 'id'> & { versionId: string } {
    const { id, ...rest } = version
    return { versionId: id, ...rest }
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const created = await this.service.create(req.body, req.user!)
    res.status(201).json(this.toResponse(created))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.service.update(req.params.id, req.body, req.user!)
    res.status(200).json(this.toResponse(updated))
  }

  delete = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id, req.user!)
    res.status(204).end()
  }

  get = async (req: Request, res: Response): Promise<void> => {
    const topic = await this.service.get(req.params.id, req.query.version as number | undefined)
    res.status(200).json(this.toResponse(topic))
  }

  getTree = async (req: Request, res: Response): Promise<void> => {
    const tree = await this.service.getTree(req.params.id)
    res.status(200).json(tree)
  }

  getShortestPath = async (req: Request, res: Response): Promise<void> => {
    const q = (res.locals as { shortestPathQuery?: { from: string; to: string } }).shortestPathQuery
    const fromId = (q?.from ?? (req.query.from as string)) as string
    const toId = (q?.to ?? (req.query.to as string)) as string
    const result = await this.service.getShortestPath(fromId, toId)
    res.status(200).json(result)
  }
}
