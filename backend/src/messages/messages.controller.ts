import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    return await this.messagesService.getUserConversations(req.user.sub);
  }

  @Get(':conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return await this.messagesService.getMessages(conversationId, limit, offset);
  }

  @Post('conversation')
  async createConversation(@Request() req, @Body() body: { targetUserId: string }) {
    const convo = await this.messagesService.getOrCreateConversation(req.user.sub, body.targetUserId);
    
    let otherParticipant = convo.participants?.find(p => p.id !== req.user.sub);
    if (!otherParticipant && convo.participants?.length > 0) {
      otherParticipant = convo.participants[0];
    }

    return {
      id: convo.id,
      user: otherParticipant ? {
        id: otherParticipant.id,
        username: otherParticipant.username || otherParticipant.email?.split('@')[0],
        avatar: otherParticipant.avatar,
      } : null,
      latestMessage: null,
      unreadCount: 0,
      updatedAt: convo.updatedAt,
    };
  }

  @Post(':conversationId/read')
  async markAsRead(@Request() req, @Param('conversationId') conversationId: string) {
    await this.messagesService.markAsRead(conversationId, req.user.sub);
    return { success: true };
  }
}
