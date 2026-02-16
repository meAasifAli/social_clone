import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { PostLike } from '../entities/post-like.entity';
import { PostRepost } from '../entities/post-repost.entity';
import { PostComment } from '../entities/post-comment.entity';
import { Follow } from '../entities/follow.entity';
import { NotificationType } from '../entities/notification.entity';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from './dto/pagination.dto';
import { SearchDto } from './dto/search.dto';
import { ImagekitService } from '../services/media.service';
import { generateRandomPostColor } from './utils/color.util';
import { NotificationGateway } from '../notifications/notifications.gateway';
import 'multer';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(PostLike)
    private readonly likeRepo: Repository<PostLike>,

    @InjectRepository(PostRepost)
    private readonly repostRepo: Repository<PostRepost>,

    @InjectRepository(PostComment)
    private readonly commentRepo: Repository<PostComment>,

    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly imagekitService: ImagekitService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createPost(
    userId: string,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ) {
    const author = await this.userRepo.findOne({ where: { id: userId } });
    if (!author) throw new NotFoundException('User not found');

    let imageUrl: string | undefined = dto.image;

    if (file) {
      const upload = await this.imagekitService.uploadFile(
        file.buffer,
        file.originalname,
        '/posts',
      );
      imageUrl = upload.url;
    }

    const backgroundColor = generateRandomPostColor();

    const post = this.postRepo.create({
      content: dto.content,
      image: imageUrl,
      backgroundColor,
      author,
    });

    await this.postRepo.save(post);
    return this.getPostById(post.id, userId);
  }

  async updatePost(
    postId: string,
    userId: string,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.author.id !== userId)
      throw new ForbiddenException('You cannot edit this post');

    if (dto.content !== undefined) post.content = dto.content;

    if (file) {
      const upload = await this.imagekitService.uploadFile(
        file.buffer,
        file.originalname,
        '/posts',
      );
      post.image = upload.url;
    }

    if (dto.image === null) {
      post.image = null as any;
    }

    await this.postRepo.save(post);
    return this.getPostById(post.id, userId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post || post.deletedAt) throw new NotFoundException('Post not found');
    if (post.author.id !== userId)
      throw new ForbiddenException('You cannot delete this post');

    await this.postRepo.softDelete(postId);
    return { success: true };
  }

  async getPostById(postId: string, viewerId?: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['author'],
    });

    if (!post || post.deletedAt) throw new NotFoundException('Post not found');

    let liked = false;
    let reposted = false;

    if (viewerId) {
      const [like, repost] = await Promise.all([
        this.likeRepo.findOne({
          where: { post: { id: postId }, user: { id: viewerId } },
        }),
        this.repostRepo.findOne({
          where: { post: { id: postId }, user: { id: viewerId } },
        }),
      ]);

      liked = !!like;
      reposted = !!repost;
    }

    return {
      ...post,
      viewer: {
        liked,
        reposted,
      },
    };
  }

  async getFeed(viewerId: string, dto: PaginationDto) {
    const limit = dto.limit ?? 10;
    const offset = dto.offset ?? 0;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (dto.authorId) {
      qb.andWhere('author.id = :authorId', { authorId: dto.authorId });
    }

    const [posts, total] = await qb.getManyAndCount();
    const postIds = posts.map((p) => p.id);

    const [likes, reposts] = await Promise.all([
      postIds.length
        ? this.likeRepo.find({
            where: {
              user: { id: viewerId },
              post: { id: In(postIds) },
            },
            relations: ['post'],
          })
        : [],
      postIds.length
        ? this.repostRepo.find({
            where: {
              user: { id: viewerId },
              post: { id: In(postIds) },
            },
            relations: ['post'],
          })
        : [],
    ]);

    const likedSet = new Set(likes.map((l) => l.post.id));
    const repostedSet = new Set(reposts.map((r) => r.post.id));

    return {
      total,
      limit,
      offset,
      data: posts.map((p) => ({
        ...p,
        viewer: {
          liked: likedSet.has(p.id),
          reposted: repostedSet.has(p.id),
        },
      })),
    };
  }

  async likePost(postId: string, userId: string) {
    return this.postRepo.manager.transaction(async (manager) => {
      const postRepo = manager.getRepository(Post);
      const likeRepo = manager.getRepository(PostLike);
      const userRepo = manager.getRepository(User);

      const post = await postRepo.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post || post.deletedAt)
        throw new NotFoundException('Post not found');

      const exists = await likeRepo.findOne({
        where: { post: { id: postId }, user: { id: userId } },
      });

      if (exists) return { success: true };

      await likeRepo.save({
        post: { id: postId } as any,
        user: { id: userId } as any,
      });

      await postRepo.increment({ id: postId }, 'likeCount', 1);

      // Send notification to post author (if not self-like)
      if (post.author.id !== userId) {
        const actor = await userRepo.findOne({ where: { id: userId } });
        const actorName =
          actor?.username ||
          (actor?.email ? actor.email.split('@')[0] : 'Unknown User');

        await this.notificationGateway.createAndSendNotification({
          type: NotificationType.LIKE,
          userId: post.author.id,
          actorId: userId,
          actorName,
          actorAvatar: actor?.avatar,
          data: {
            postId: post.id,
            postContent: post.content.substring(0, 100),
          },
        });
      }

      return { success: true };
    });
  }

  async unlikePost(postId: string, userId: string) {
    return this.postRepo.manager.transaction(async (manager) => {
      const postRepo = manager.getRepository(Post);
      const likeRepo = manager.getRepository(PostLike);

      const post = await postRepo.findOne({ where: { id: postId } });
      if (!post || post.deletedAt)
        throw new NotFoundException('Post not found');

      const res = await likeRepo.delete({
        post: { id: postId },
        user: { id: userId },
      });

      if (res.affected && res.affected > 0) {
        await postRepo.decrement({ id: postId }, 'likeCount', 1);
      }

      return { success: true };
    });
  }

  async repost(postId: string, userId: string) {
    return this.postRepo.manager.transaction(async (manager) => {
      const postRepo = manager.getRepository(Post);
      const repostRepo = manager.getRepository(PostRepost);
      const userRepo = manager.getRepository(User);

      const post = await postRepo.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post || post.deletedAt)
        throw new NotFoundException('Post not found');

      const exists = await repostRepo.findOne({
        where: { post: { id: postId }, user: { id: userId } },
      });

      if (exists) return { success: true };

      await repostRepo.save({
        post: { id: postId } as any,
        user: { id: userId } as any,
      });

      await postRepo.increment({ id: postId }, 'repostCount', 1);

      // Send notification to post author (if not self-repost)
      if (post.author.id !== userId) {
        const actor = await userRepo.findOne({ where: { id: userId } });
        const actorName =
          actor?.username ||
          (actor?.email ? actor.email.split('@')[0] : 'Unknown User');

        await this.notificationGateway.createAndSendNotification({
          type: NotificationType.REPOST,
          userId: post.author.id,
          actorId: userId,
          actorName,
          actorAvatar: actor?.avatar,
          data: {
            postId: post.id,
            postContent: post.content.substring(0, 100),
          },
        });
      }

      return { success: true };
    });
  }

  async undoRepost(postId: string, userId: string) {
    return this.postRepo.manager.transaction(async (manager) => {
      const postRepo = manager.getRepository(Post);
      const repostRepo = manager.getRepository(PostRepost);

      const post = await postRepo.findOne({ where: { id: postId } });
      if (!post || post.deletedAt)
        throw new NotFoundException('Post not found');

      const res = await repostRepo.delete({
        post: { id: postId },
        user: { id: userId },
      });

      if (res.affected && res.affected > 0) {
        await postRepo.decrement({ id: postId }, 'repostCount', 1);
      }

      return { success: true };
    });
  }

  async addComment(postId: string, userId: string, dto: CreateCommentDto) {
    return this.postRepo.manager.transaction(async (manager) => {
      const postRepo = manager.getRepository(Post);
      const commentRepo = manager.getRepository(PostComment);
      const userRepo = manager.getRepository(User);

      const post = await postRepo.findOne({
        where: { id: postId },
        relations: ['author'],
      });

      if (!post || post.deletedAt)
        throw new NotFoundException('Post not found');

      let parent: PostComment | null = null;

      if (dto.parentId) {
        parent = await commentRepo.findOne({
          where: { id: dto.parentId },
          relations: ['post'],
        });

        if (!parent) throw new BadRequestException('Parent comment not found');
        if (parent.post.id !== postId)
          throw new BadRequestException('Invalid parent comment');
      }

      const comment = commentRepo.create({
        content: dto.content,
        post: { id: postId } as Post,
        author: { id: userId } as User,
        ...(parent ? { parent: { id: parent.id } as PostComment } : {}),
      });

      await commentRepo.save(comment);
      await postRepo.increment({ id: postId }, 'commentCount', 1);

      // Send notification to post author (if not self-comment)
      if (post.author.id !== userId) {
        const actor = await userRepo.findOne({ where: { id: userId } });
        const actorName =
          actor?.username ||
          (actor?.email ? actor.email.split('@')[0] : 'Unknown User');

        await this.notificationGateway.createAndSendNotification({
          type: NotificationType.COMMENT,
          userId: post.author.id,
          actorId: userId,
          actorName,
          actorAvatar: actor?.avatar,
          data: {
            postId: post.id,
            commentId: comment.id,
            commentContent: dto.content.substring(0, 100),
          },
        });
      }

      return { success: true, commentId: comment.id };
    });
  }

  async getComments(postId: string, dto: PaginationDto) {
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;

    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post || post.deletedAt) throw new NotFoundException('Post not found');

    const [comments, total] = await this.commentRepo.findAndCount({
      where: {
        post: { id: postId },
        parent: IsNull(),
      },
      relations: ['author', 'replies', 'replies.author'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { total, limit, offset, data: comments };
  }

  async searchPosts(viewerId: string, searchDto: SearchDto) {
    const { q, page = 1, limit = 20 } = searchDto;
    const skip = (page - 1) * limit;

    let posts: Post[] = [];
    let total = 0;

    if (!q || q.trim() === '') {
      const [allPosts, count] = await this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.deletedAt IS NULL')
        .orderBy('post.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      posts = allPosts;
      total = count;
    } else {
      const searchTerm = `%${q.toLowerCase()}%`;

      const queryBuilder = this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .where('post.deletedAt IS NULL')
        .andWhere(
          '(LOWER(post.content) LIKE :searchTerm OR LOWER(author.username) LIKE :searchTerm OR LOWER(author.fullName) LIKE :searchTerm)',
          { searchTerm },
        )
        .orderBy('post.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const [allPosts, count] = await queryBuilder.getManyAndCount();
      posts = allPosts;
      total = count;
    }

    const postIds = posts.map((p) => p.id);

    const [likes, reposts] = await Promise.all([
      postIds.length
        ? this.likeRepo.find({
            where: {
              user: { id: viewerId },
              post: { id: In(postIds) },
            },
            relations: ['post'],
          })
        : [],
      postIds.length
        ? this.repostRepo.find({
            where: {
              user: { id: viewerId },
              post: { id: In(postIds) },
            },
            relations: ['post'],
          })
        : [],
    ]);

    const likedSet = new Set(likes.map((l) => l.post.id));
    const repostedSet = new Set(reposts.map((r) => r.post.id));

    return {
      total,
      page,
      limit,
      data: posts.map((p) => ({
        ...p,
        viewer: {
          liked: likedSet.has(p.id),
          reposted: repostedSet.has(p.id),
        },
      })),
    };
  }

  async searchUsers(viewerId: string, searchDto: SearchDto) {
    const { q, page = 1, limit = 20 } = searchDto;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === '') {
      return { total: 0, page, limit, data: [] };
    }

    const searchTerm = `%${q.toLowerCase()}%`;

    const users = await this.userRepo
      .createQueryBuilder('user')
      .where(
        'LOWER(user.username) LIKE :searchTerm OR LOWER(user.fullName) LIKE :searchTerm OR LOWER(user.email) LIKE :searchTerm',
        { searchTerm },
      )
      .limit(limit)
      .offset(skip)
      .getMany();

    const total = await this.userRepo
      .createQueryBuilder('user')
      .where(
        'LOWER(user.username) LIKE :searchTerm OR LOWER(user.fullName) LIKE :searchTerm OR LOWER(user.email) LIKE :searchTerm',
        { searchTerm },
      )
      .getCount();

    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const isFollowing = await this.followRepo.findOne({
          where: {
            follower: { id: viewerId },
            following: { id: user.id },
          },
        });

        return {
          ...user,
          isFollowing: !!isFollowing,
        };
      }),
    );

    return {
      total,
      page,
      limit,
      data: usersWithFollowStatus,
    };
  }
}
