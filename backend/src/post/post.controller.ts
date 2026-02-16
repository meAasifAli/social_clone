import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from './dto/pagination.dto';

import { JwtRequest } from '../types/jwt-request.type';
import { SearchDto } from './dto/search.dto';

@Controller('post')
@UseGuards(AuthGuard('jwt'))
export class PostController {
  constructor(private readonly postService: PostService) {}

  /**
   * multipart/form-data
   * fields:
   * - content (string)
   * - image (file) optional
   */
  @HttpPost()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req: JwtRequest,
    @Body() dto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postService.createPost(req.user.sub, dto, file);
  }

  @Get('feed')
  feed(@Req() req: JwtRequest, @Query() dto: PaginationDto) {
    return this.postService.getFeed(req.user.sub, dto);
  }

  @Get(':id')
  getById(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.getPostById(id, req.user.sub);
  }

  /**
   * multipart/form-data
   * fields:
   * - content (optional)
   * - image (file) optional
   * - image = null (optional) => remove image
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Req() req: JwtRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postService.updatePost(id, req.user.sub, dto, file);
  }

  @Delete(':id')
  delete(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.deletePost(id, req.user.sub);
  }

  // Likes
  @HttpPost(':id/like')
  like(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.likePost(id, req.user.sub);
  }

  @HttpPost(':id/unlike')
  unlike(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.unlikePost(id, req.user.sub);
  }

  // Reposts
  @HttpPost(':id/repost')
  repost(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.repost(id, req.user.sub);
  }

  @HttpPost(':id/undo-repost')
  undoRepost(@Req() req: JwtRequest, @Param('id') id: string) {
    return this.postService.undoRepost(id, req.user.sub);
  }

  // Comments
  @HttpPost(':id/comments')
  addComment(
    @Req() req: JwtRequest,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postService.addComment(id, req.user.sub, dto);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @Query() dto: PaginationDto) {
    return this.postService.getComments(id, dto);
  }

  @Get('search/all')
  async searchAll(@Req() req: JwtRequest, @Query() searchDto: SearchDto) {
    return this.postService.searchPosts(req.user.sub, searchDto);
  }

  @Get('search/posts')
  async searchPosts(@Req() req: JwtRequest, @Query() searchDto: SearchDto) {
    searchDto.type = 'posts';
    return this.postService.searchPosts(req.user.sub, searchDto);
  }

  @Get('search/users')
  async searchUsers(@Req() req: JwtRequest, @Query() searchDto: SearchDto) {
    return this.postService.searchUsers(req.user.sub, searchDto);
  }
}
