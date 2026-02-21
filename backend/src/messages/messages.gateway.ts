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
import { MessagesService } from './messages.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/messages',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MessagesGateway');
  // Map of socket.id -> userId
  private connectedUsers: Map<string, string> = new Map();
  // Map of userId -> Set of socket.ids
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      this.connectedUsers.set(client.id, userId);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
        // User came online (no active sockets previously)
        this.server.emit('user_status', { userId, status: 'online' });
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join a room for strictly this user for DM delivery
      await client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Let the connecting user know who is currently online
      const onlineUsers = Array.from(this.userSockets.keys());
      client.emit('online_users', onlineUsers);

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);

      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          // User went offline
          this.server.emit('user_status', { userId, status: 'offline' });
        }
      }
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; targetUserId?: string },
  ) {
    try {
      const senderId = this.connectedUsers.get(client.id);
      if (!senderId) return;

      let conversationId = data.conversationId;

      if (!conversationId && data.targetUserId) {
        const convo = await this.messagesService.getOrCreateConversation(senderId, data.targetUserId);
        conversationId = convo.id;
      }

      if (!conversationId) return;

      const message = await this.messagesService.createMessage(
        senderId,
        conversationId,
        data.content,
      );

      const conversation = await this.messagesService.getConversationById(conversationId);
      if (conversation) {
        conversation.participants.forEach((p) => {
          this.server.to(`user:${p.id}`).emit('new_message', {
            message,
            conversationId,
          });
        });
      }

    } catch (error) {
      this.logger.error('Error sending message', error);
    }
  }
}
