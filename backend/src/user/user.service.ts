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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
  ) {}

  async getById(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) throw new NotFoundException('User not found');

    if (!user.profile) {
      user.profile = this.userRepo.manager.create('UserProfile', dto);
    } else {
      Object.assign(user.profile, dto);
    }

    await this.userRepo.save(user);
    return this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
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

    return { success: true };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    await this.followRepo.delete({
      follower: { id: currentUserId },
      following: { id: targetUserId },
    });

    return { success: true };
  }
}
