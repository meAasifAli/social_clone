import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.actor', 'actor')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Format notifications for frontend
    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      actor: {
        id: notification.actorId,
        name: notification.actorName,
        avatar: notification.actorAvatar,
      },
      data: notification.data,
      read: notification.read,
      createdAt: notification.createdAt,
    }));

    return {
      data: formattedNotifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({
      where: { userId, read: false },
    });
    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    await this.notificationRepo.save(notification);

    // Get updated unread count
    const unreadCount = await this.getUnreadCount(userId);

    return {
      success: true,
      unreadCount: unreadCount.count,
    };
  }

  async markMultipleAsRead(userId: string, notificationIds: string[]) {
    await this.notificationRepo.update(
      { id: In(notificationIds), userId },
      { read: true },
    );

    const unreadCount = await this.getUnreadCount(userId);

    return {
      success: true,
      unreadCount: unreadCount.count,
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, read: false }, { read: true });

    return {
      success: true,
      unreadCount: 0,
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const result = await this.notificationRepo.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }

    const unreadCount = await this.getUnreadCount(userId);

    return {
      success: true,
      unreadCount: unreadCount.count,
    };
  }

  async clearAll(userId: string) {
    await this.notificationRepo.delete({ userId });

    return {
      success: true,
      message: 'All notifications cleared',
    };
  }

  async getNotificationsByType(
    userId: string,
    type: NotificationType,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.actor', 'actor')
      .where('notification.userId = :userId', { userId })
      .andWhere('notification.type = :type', { type })
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        type,
      },
    };
  }

  async getNotificationStats(userId: string) {
    const stats = await this.notificationRepo
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    const total = await this.notificationRepo.count({
      where: { userId },
    });

    const unread = await this.notificationRepo.count({
      where: { userId, read: false },
    });

    return {
      total,
      unread,
      byType: stats.reduce((acc, curr) => {
        acc[curr.type] = parseInt(curr.count);
        return acc;
      }, {}),
    };
  }
}
