import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { PostLike } from './post-like.entity';
import { PostComment } from './post-comment.entity';
import { PostRepost } from './post-repost.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true, length: 7 }) // Hex color code like #FF5733
  backgroundColor?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  /* Counters (for fast reads) */
  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ default: 0 })
  repostCount: number;

  @OneToMany(() => PostLike, (l) => l.post)
  likes: PostLike[];

  @OneToMany(() => PostComment, (c) => c.post)
  comments: PostComment[];

  @OneToMany(() => PostRepost, (r) => r.post)
  reposts: PostRepost[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
