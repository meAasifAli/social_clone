import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  REPOST = 'repost',
  MENTION = 'mention',
}

@Entity('notifications')
@Index(['userId', 'read']) // For fetching unread count
@Index(['userId', 'createdAt']) // For sorting by date
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User; // Recipient of the notification

  @Column()
  userId: string; // For faster queries

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  actor: User; // User who performed the action

  @Column()
  actorId: string; // For faster queries

  @Column({ nullable: true })
  actorName: string;

  @Column({ nullable: true })
  actorAvatar: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  data: {
    postId?: string;
    postContent?: string;
    commentId?: string;
    commentContent?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  // Helper method to create notification object
  static create(params: {
    type: NotificationType;
    userId: string;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    data?: any;
  }): Partial<Notification> {
    return {
      type: params.type,
      userId: params.userId,
      actorId: params.actorId,
      actorName: params.actorName,
      actorAvatar: params.actorAvatar,
      data: params.data || {},
      read: false,
    };
  }
}
