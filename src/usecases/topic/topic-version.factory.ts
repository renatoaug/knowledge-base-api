import crypto from 'node:crypto'
import { TopicAction, TopicId, TopicVersion } from 'src/models/topic'

export interface CreateVersionInput {
  name: string
  content: string
  parentTopicId: TopicId | null
}

export interface UpdateVersionInput {
  name: string
  content: string
  parentTopicId: TopicId | null
}

export class TopicVersionFactory {
  static fromCreate(
    topicId: TopicId,
    input: CreateVersionInput,
    now: number,
    performedBy: string,
  ): TopicVersion {
    return {
      id: crypto.randomUUID(),
      topicId,
      version: 1,
      name: input.name,
      content: input.content,
      parentTopicId: input.parentTopicId,
      createdAt: now,
      updatedAt: now,
      action: TopicAction.CREATE,
      performedBy,
    }
  }

  static fromUpdate(
    topicId: TopicId,
    nextVersion: number,
    previous: TopicVersion,
    input: Partial<UpdateVersionInput>,
    now: number,
    performedBy: string,
  ): TopicVersion {
    return {
      id: crypto.randomUUID(),
      topicId,
      version: nextVersion,
      name: input.name ?? previous.name,
      content: input.content ?? previous.content,
      parentTopicId:
        input.parentTopicId === undefined ? (previous.parentTopicId ?? null) : input.parentTopicId,
      createdAt: previous.createdAt,
      updatedAt: now,
      action: TopicAction.UPDATE,
      performedBy,
    }
  }

  static fromDelete(
    topicId: TopicId,
    nextVersion: number,
    previous: TopicVersion,
    now: number,
    performedBy: string,
  ): TopicVersion {
    return {
      id: crypto.randomUUID(),
      topicId,
      version: nextVersion,
      name: previous.name,
      content: previous.content,
      parentTopicId: previous.parentTopicId ?? null,
      createdAt: previous.createdAt,
      updatedAt: now,
      action: TopicAction.DELETE,
      performedBy,
    }
  }
}
