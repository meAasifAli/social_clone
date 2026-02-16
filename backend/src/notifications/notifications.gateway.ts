import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  Notification,
  NotificationType,
} from '../entities/notification.entity';

interface ConnectedUser {
  socketId: string;
  userId: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn('No token provided, disconnecting');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['id', 'username', 'email', 'avatar'],
      });

      if (!user) {
        client.disconnect();
        return;
      }

      const username = user.username || user.email.split('@')[0];

      this.connectedUsers.set(client.id, {
        socketId: client.id,
        userId,
        username,
      });

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      await client.join(`user:${userId}`);

      // Get unread count and send to user
      const unreadCount = await this.notificationRepo.count({
        where: { userId, read: false },
      });

      client.emit('connected', {
        socketId: client.id,
        userId,
        unreadCount,
        message: 'Connected to notification server',
      });

      this.broadcastOnlineStatus(userId, true);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

      const onlineUsers = Array.from(this.userSockets.keys());
      client.emit('online:users', onlineUsers);
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);

    if (user) {
      this.connectedUsers.delete(client.id);

      const userSockets = this.userSockets.get(user.userId);
      if (userSockets) {
        userSockets.delete(client.id);

        if (userSockets.size === 0) {
          this.userSockets.delete(user.userId);
          this.broadcastOnlineStatus(user.userId, false);
        }
      }

      this.logger.log(
        `Client disconnected: ${client.id} (User: ${user.userId})`,
      );
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('mark:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      await this.notificationRepo.update(
        { id: data.notificationId },
        { read: true },
      );

      // Get updated unread count
      const user = this.connectedUsers.get(client.id);
      if (user) {
        const unreadCount = await this.notificationRepo.count({
          where: { userId: user.userId, read: false },
        });
        client.emit('unread:count', unreadCount);
      }
    } catch (error) {
      this.logger.error('Error marking notification as read:', error);
    }
  }

  @SubscribeMessage('mark:all:read')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (user) {
        await this.notificationRepo.update(
          { userId: user.userId, read: false },
          { read: true },
        );
        client.emit('unread:count', 0);
      }
    } catch (error) {
      this.logger.error('Error marking all notifications as read:', error);
    }
  }

  @SubscribeMessage('get:notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { page?: number; limit?: number },
  ) {
    try {
      const user = this.connectedUsers.get(client.id);
      if (!user) return;

      const page = data.page || 1;
      const limit = data.limit || 20;
      const skip = (page - 1) * limit;

      const [notifications, total] = await this.notificationRepo
        .createQueryBuilder('notification')
        .leftJoinAndSelect('notification.actor', 'actor')
        .where('notification.userId = :userId', { userId: user.userId })
        .orderBy('notification.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      client.emit('notifications:list', {
        data: notifications,
        total,
        page,
        limit,
      });
    } catch (error) {
      this.logger.error('Error fetching notifications:', error);
    }
  }

  // Create and send notification
  async createAndSendNotification(params: {
    type: NotificationType;
    userId: string;
    actorId: string;
    actorName: string;
    actorAvatar?: string;
    data?: any;
  }): Promise<Notification> {
    try {
      // Create notification in database
      const notification = this.notificationRepo.create({
        type: params.type,
        userId: params.userId,
        actorId: params.actorId,
        actorName: params.actorName,
        actorAvatar: params.actorAvatar,
        data: params.data || {},
        read: false,
      });

      await this.notificationRepo.save(notification);

      // Get actor details for real-time notification
      const notificationWithActor = await this.notificationRepo.findOne({
        where: { id: notification.id },
        relations: ['actor'],
      });

      // Send real-time notification if user is online
      const userSockets = this.userSockets.get(params.userId);
      if (userSockets && userSockets.size > 0) {
        this.server.to(`user:${params.userId}`).emit('notification', {
          ...notificationWithActor,
          timestamp: new Date().toISOString(),
        });

        // Send updated unread count
        const unreadCount = await this.notificationRepo.count({
          where: { userId: params.userId, read: false },
        });

        this.server
          .to(`user:${params.userId}`)
          .emit('unread:count', unreadCount);

        this.logger.debug(
          `Real-time notification sent to user ${params.userId}`,
        );
      }

      return notification;
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create bulk notifications
  async createBulkNotifications(
    notifications: Array<{
      type: NotificationType;
      userId: string;
      actorId: string;
      actorName: string;
      actorAvatar?: string;
      data?: any;
    }>,
  ): Promise<Notification[]> {
    const created = this.notificationRepo.create(notifications);
    await this.notificationRepo.save(created);

    // Send real-time updates to online users
    for (const notification of created) {
      const userSockets = this.userSockets.get(notification.userId);
      if (userSockets && userSockets.size > 0) {
        this.server
          .to(`user:${notification.userId}`)
          .emit('notification', notification);
      }
    }

    return created;
  }

  // Mark notifications as read
  async markAsRead(userId: string, notificationIds: string[]) {
    await this.notificationRepo.update(
      { id: In(notificationIds), userId },
      { read: true },
    );

    const unreadCount = await this.notificationRepo.count({
      where: { userId, read: false },
    });

    this.server.to(`user:${userId}`).emit('unread:count', unreadCount);
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    await this.notificationRepo.update({ userId, read: false }, { read: true });
    this.server.to(`user:${userId}`).emit('unread:count', 0);
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, read: false },
    });
  }

  // Broadcast online status
  private broadcastOnlineStatus(userId: string, online: boolean) {
    this.server.emit('user:status', {
      userId,
      online,
      timestamp: new Date().toISOString(),
    });
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get all online user IDs
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }
}
