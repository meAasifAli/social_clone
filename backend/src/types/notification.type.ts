export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  REPOST = 'repost',
  MENTION = 'mention',
  MESSAGE = 'message',
}

export interface BaseNotification {
  id: string;
  type: NotificationType;
  userId: string; // recipient user ID
  actorId: string; // user who performed the action
  actorName: string;
  actorAvatar?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface LikeNotification extends BaseNotification {
  type: NotificationType.LIKE;
  data: {
    postId: string;
    postContent?: string;
  };
}

export interface CommentNotification extends BaseNotification {
  type: NotificationType.COMMENT;
  data: {
    postId: string;
    commentId: string;
    commentContent: string;
  };
}

export interface FollowNotification extends BaseNotification {
  type: NotificationType.FOLLOW;
  data: Record<string, never>;
}

export interface MessageNotification extends BaseNotification {
  type: NotificationType.MESSAGE;
  data: {
    messageContent: string;
    conversationId: string;
  };
}

export type Notification =
  | LikeNotification
  | CommentNotification
  | FollowNotification
  | MessageNotification;
