import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { JwtRequest } from '../types/jwt-request.type';
import { NotificationType } from '../entities/notification.entity';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Req() req: JwtRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user.sub,
      page,
      limit,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: JwtRequest) {
    return this.notificationsService.getUnreadCount(req.user.sub);
  }

  @Get('stats')
  async getStats(@Req() req: JwtRequest) {
    return this.notificationsService.getNotificationStats(req.user.sub);
  }

  @Get('type/:type')
  async getNotificationsByType(
    @Req() req: JwtRequest,
    @Param('type') type: NotificationType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationsService.getNotificationsByType(
      req.user.sub,
      type,
      page,
      limit,
    );
  }

  @Patch(':id/read')
  @HttpCode(200)
  async markAsRead(
    @Req() req: JwtRequest,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(req.user.sub, notificationId);
  }

  @Patch('read-multiple')
  @HttpCode(200)
  async markMultipleAsRead(
    @Req() req: JwtRequest,
    @Body() body: { notificationIds: string[] },
  ) {
    return this.notificationsService.markMultipleAsRead(
      req.user.sub,
      body.notificationIds,
    );
  }

  @Patch('read-all')
  @HttpCode(200)
  async markAllAsRead(@Req() req: JwtRequest) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Delete(':id')
  async deleteNotification(
    @Req() req: JwtRequest,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(
      req.user.sub,
      notificationId,
    );
  }

  @Delete('clear-all')
  async clearAll(@Req() req: JwtRequest) {
    return this.notificationsService.clearAll(req.user.sub);
  }
}
