import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationGateway } from './notifications.gateway';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notification]),
    ConfigModule, // 👈 Add ConfigModule here
    JwtModule.registerAsync({
      imports: [ConfigModule], // 👈 Add imports here
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationGateway, NotificationsService],
  exports: [NotificationGateway, NotificationsService], // 👈 Export them so other modules can use them
  controllers: [NotificationsController],
})
export class NotificationModule {}
