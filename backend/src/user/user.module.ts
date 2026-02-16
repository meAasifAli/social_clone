import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { ImagekitService } from '../services/media.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  providers: [UserService, ImagekitService],
  controllers: [UserController],
})
export class UserModule {}
