export type ResourceId = string

export enum ResourceType {
  VIDEO = 'video',
  ARTICLE = 'article',
  PDF = 'pdf',
  LINK = 'link',
}

export interface Resource {
  id: ResourceId
  topicId: string
  url: string
  description: string
  type: ResourceType
  createdAt: number
  updatedAt: number
}
