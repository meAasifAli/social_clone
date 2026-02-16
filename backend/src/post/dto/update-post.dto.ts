import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  content?: string;

  /**
   * image can be:
   * - string (new url)
   * - null (remove image)
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string | null;
}
