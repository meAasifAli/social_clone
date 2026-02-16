import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower', 'following'])
@Index(['follower'])
@Index(['following'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' }) // Explicitly set column name
  follower: User;

  @ManyToOne(() => User, (u) => u.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' }) // Explicitly set column name
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}
