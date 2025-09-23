export type TopicId = string

export enum TopicAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface TopicVersion {
  id: string
  topicId: TopicId
  version: number
  name: string
  content: string
  parentTopicId?: TopicId | null
  createdAt: number
  updatedAt: number
  action: TopicAction
  performedBy: string
}

export interface Topic {
  topicId: TopicId
  latestVersion: number
  deletedAt: number | null
}
