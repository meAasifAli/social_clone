import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { NotificationGateway } from '../notifications/notifications.gateway';
import { NotificationType } from '../entities/notification.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async getUserConversations(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'user', 'user.id = :userId', { userId })
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .orderBy('messages.createdAt', 'DESC')
      .getMany();

    // Map the shape for the frontend
    return conversations.map(c => {
      // Find the "other" participant
      const otherParticipant = c.participants?.find(p => p.id !== userId) || c.participants?.[0] || null;
      
      const safeMessages = c.messages || [];
      const unreadCount = safeMessages.filter(m => !m.read && m.sender?.id !== userId).length;
      
      // Sort messages to get the latest easily
      const sortedMessages = [...safeMessages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const latestMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;

      return {
        id: c.id,
        user: otherParticipant ? {
          id: otherParticipant.id,
          username: otherParticipant.username || otherParticipant.email?.split('@')[0],
          avatar: otherParticipant.avatar,
        } : null,
        latestMessage: latestMessage ? latestMessage.content : null,
        unreadCount,
        updatedAt: latestMessage ? latestMessage.createdAt : c.updatedAt,
      };
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getMessages(conversationId: string, limit: number = 50, offset: number = 0) {
    const messages = await this.messageRepo.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Return in chronological order for UI
  }

  async getOrCreateConversation(userId1: string, userId2: string) {
    // Check if conversation already exists between these two users
    const existing = await this.conversationRepo
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'p1', 'p1.id = :userId1', { userId1 })
      .innerJoin('conversation.participants', 'p2', 'p2.id = :userId2', { userId2 })
      .leftJoinAndSelect('conversation.participants', 'participants')
      .getOne();

    if (existing) return existing;

    const user1 = await this.userRepo.findOne({ where: { id: userId1 } });
    const user2 = await this.userRepo.findOne({ where: { id: userId2 } });

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    const conversation = this.conversationRepo.create({
      participants: [user1, user2],
    });

    return await this.conversationRepo.save(conversation);
  }

  async createMessage(senderId: string, conversationId: string, content: string) {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const conversation = await this.conversationRepo.findOne({ 
      where: { id: conversationId },
      relations: ['participants']
    });

    if (!sender || !conversation) {
      throw new NotFoundException('Sender or Conversation not found');
    }

    const message = this.messageRepo.create({
      content,
      sender,
      conversation,
    });

    await this.messageRepo.save(message);

    // Update conversation updatedAt
    conversation.updatedAt = new Date();
    await this.conversationRepo.save(conversation);

    // Send notifications to other participants
    const recipients = conversation.participants.filter(p => p.id !== sender.id);
    for (const recipient of recipients) {
      try {
        await this.notificationGateway.createAndSendNotification({
          type: NotificationType.MESSAGE,
          userId: recipient.id,
          actorId: sender.id,
          actorName: sender.username || sender.email.split('@')[0],
          actorAvatar: sender.avatar,
          data: {
            messageContent: content,
            conversationId: conversation.id,
          },
        });
      } catch (err) {
        console.error('Failed to send message notification', err);
      }
    }

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where("conversation_id = :conversationId", { conversationId })
      .andWhere("sender_id != :userId", { userId })
      .execute();
  }

  async getConversationById(conversationId: string) {
    return await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
  }
}
