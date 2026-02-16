import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ImagekitService } from '../services/media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { PostLike } from '../entities/post-like.entity';
import { User } from '../entities/user.entity';
import { PostRepost } from '../entities/post-repost.entity';
import { PostComment } from '../entities/post-comment.entity';
import { Follow } from '../entities/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      PostLike,
      User,
      PostRepost,
      PostComment,
      Follow,
    ]),
  ],
  providers: [PostService, ImagekitService],
  controllers: [PostController],
})
export class PostModule {}
