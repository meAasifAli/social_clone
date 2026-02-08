import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @ManyToOne(() => Post, (p) => p.comments, { onDelete: 'CASCADE' })
  post: Post;

  /* replies */
  @ManyToOne(() => PostComment, (c) => c.replies, { nullable: true })
  parent?: PostComment;

  @OneToMany(() => PostComment, (c) => c.parent)
  replies: PostComment[];

  @CreateDateColumn()
  createdAt: Date;
}
