import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Trim } from '@/base/decorators/common.decorator';
export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com' })
  @IsNotEmpty({ message: 'email không được để trống' })
  @Transform(({ value }) => value && value.trim())
  @IsString()
  email: string;

  @ApiProperty({ example: 123123 })
  @IsNotEmpty({ message: 'USER011101' })
  @IsString()
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @Trim()
  @IsString()
  username: string;
}
