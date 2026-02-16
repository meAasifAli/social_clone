import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ImagekitService } from '../services/media.service';
import { Suggestion } from '../types/suggestion.type';
import { NotificationGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,

    private readonly imagekitService: ImagekitService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async getById(userId: string, viewerId?: string) {
    const result = await this.userRepo.query(
      `
      SELECT 
        u.*,
        COALESCE(followers.count, 0) as "followersCount",
        COALESCE(following.count, 0) as "followingCount",
        CASE 
          WHEN $2::uuid IS NOT NULL AND $2 != $1 THEN 
            EXISTS(
              SELECT 1 FROM follows f 
              WHERE f."followerId" = $2 
              AND f."followingId" = $1
            )
          ELSE false
        END as "isFollowing"
      FROM users u
      LEFT JOIN (
        SELECT "followingId", COUNT(*) as count 
        FROM follows 
        GROUP BY "followingId"
      ) followers ON followers."followingId" = u.id
      LEFT JOIN (
        SELECT "followerId", COUNT(*) as count 
        FROM follows 
        GROUP BY "followerId"
      ) following ON following."followerId" = u.id
      WHERE u.id = $1
    `,
      [userId, viewerId],
    );

    if (!result[0]) throw new NotFoundException('User not found');
    return result[0];
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    console.log('Updating profile for user:', userId);
    console.log('DTO received:', dto);
    console.log('File received:', file ? file.originalname : 'No file');

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.error('User not found with ID:', userId);
      throw new NotFoundException('User not found');
    }

    console.log('User found:', user.id, user.username);

    try {
      if (file) {
        // Delete old avatar if exists
        if (user.avatar) {
          try {
            const oldFileId = this.imagekitService.extractFileIdFromUrl(
              user.avatar,
            );
            if (oldFileId) {
              await this.imagekitService.deleteFile(oldFileId);
              console.log('Old avatar deleted from ImageKit');
            }
          } catch (deleteError) {
            console.log('Error deleting old avatar:', deleteError);
            // Continue even if delete fails
          }
        }

        // Upload new avatar
        const fileName = `avatar-${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
        const uploadResult = await this.imagekitService.uploadFile(
          file.buffer,
          fileName,
          '/avatars',
        );
        user.avatar = uploadResult.url;
      }

      // Handle text fields from FormData

      // username
      if (dto.username !== undefined && dto.username !== '') {
        console.log(
          'Updating username from',
          user.username,
          'to',
          dto.username,
        );
        const username = dto.username.trim();
        if (!username) {
          throw new BadRequestException('Username cannot be empty');
        }

        // Check if username is already taken (excluding current user)
        const existingUser = await this.userRepo.findOne({
          where: { username },
        });
        if (existingUser && existingUser.id !== userId) {
          throw new BadRequestException('Username already taken');
        }

        user.username = username;
      }

      // fullName
      if (dto.fullName !== undefined && dto.fullName !== '') {
        console.log('Updating fullName to:', dto.fullName);
        user.fullName = dto.fullName.trim();
      }

      // bio
      if (dto.bio !== undefined) {
        user.bio = dto.bio.trim();
      }

      // website
      if (dto.website !== undefined) {
        user.website = dto.website.trim();
      }

      // location
      if (dto.location !== undefined) {
        user.location = dto.location.trim();
      }

      console.log('Saving user...');
      await this.userRepo.save(user);
      console.log('User saved successfully');

      // Return updated user
      return this.userRepo.findOne({
        where: { id: userId },
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId)
      throw new BadRequestException('Cannot follow yourself');

    const target = await this.userRepo.findOne({
      where: { id: targetUserId },
    });

    if (!target) throw new NotFoundException('User not found');

    const exists = await this.followRepo.findOne({
      where: {
        follower: { id: currentUserId },
        following: { id: targetUserId },
      },
    });

    if (exists) return { success: true };

    await this.followRepo.save({
      follower: { id: currentUserId } as any,
      following: { id: targetUserId } as any,
    });

    // Get current user details for notification
    const currentUser = await this.userRepo.findOne({
      where: { id: currentUserId },
    });

    const actorName =
      currentUser?.username ||
      (currentUser?.email ? currentUser.email.split('@')[0] : 'Unknown User');

    // Send real-time follow notification and store in database
    await this.notificationGateway.createAndSendNotification({
      type: NotificationType.FOLLOW,
      userId: targetUserId,
      actorId: currentUserId,
      actorName,
      actorAvatar: currentUser?.avatar,
      data: {},
    });

    return { success: true };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    await this.followRepo.delete({
      follower: { id: currentUserId },
      following: { id: targetUserId },
    });

    return { success: true };
  }

  async getSuggestions(currentUserId: string): Promise<Suggestion[]> {
    const suggestions = await this.userRepo
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.fullName',
        'user.avatar',
        'user.bio',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(Follow, 'follow')
          .where('follow.followingId = user.id')
          .andWhere(
            'follow.followerId IN (' +
              subQuery
                .subQuery()
                .select('f.followingId')
                .from(Follow, 'f')
                .where('f.followerId = :currentUserId')
                .getQuery() +
              ')',
          )
          .setParameter('currentUserId', currentUserId);
      }, 'mutualFollowersCount')
      .where('user.id != :currentUserId', { currentUserId })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('follow.followingId')
          .from(Follow, 'follow')
          .where('follow.followerId = :currentUserId')
          .getQuery();
        return 'user.id NOT IN ' + subQuery;
      })
      .setParameter('currentUserId', currentUserId)
      .limit(10)
      .getRawMany();

    return suggestions.map((s) => ({
      id: s.user_id,
      email: s.user_email,
      username: s.user_username,
      fullName: s.user_fullName,
      avatar: s.user_avatar,
      bio: s.user_bio,
      mutualFollowersCount: parseInt(s.mutualFollowersCount) || 0,
    }));
  }
}
