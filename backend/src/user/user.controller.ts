import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FollowUserDto } from './dto/follow-user.dto';
import { JwtRequest } from '../types/jwt-request.type';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('suggestions')
  @UseGuards(AuthGuard('jwt'))
  getSuggestions(@Req() req: JwtRequest) {
    return this.usersService.getSuggestions(req.user.sub);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  getAll(@Req() req: JwtRequest) {
    return this.usersService.getAll(req.user.sub);
  }

  @Get(':id')
  getById(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.usersService.getById(id, req.user.sub);
  }

  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar')) // 'avatar' should match the field name in FormData
  updateMe(
    @Req() req: JwtRequest,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.updateProfile(req.user.sub, dto, file);
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
