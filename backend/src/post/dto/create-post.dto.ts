import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @MaxLength(5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content: string;

  /**
   * If you are uploading via multipart,
   * you DO NOT need to send this.
   * This will be filled after ImageKit upload.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string;
}
