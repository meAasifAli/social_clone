import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FollowUserDto } from './dto/follow-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Post('follow')
  follow(@Req() req: any, @Body() dto: FollowUserDto) {
    return this.usersService.followUser(req.user.sub, dto.userId);
  }

  @Post('unfollow')
  unfollow(@Req() req: any, @Body() dto: FollowUserDto) {
    return this.usersService.unfollowUser(req.user.sub, dto.userId);
  }
}
