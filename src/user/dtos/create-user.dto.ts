import { ToNumber, Trim } from '@/base/decorators/common.decorator';
import { ERole } from '@/role/enum/roles.enum';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CmsCreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Trim()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ERole)
  @Trim()
  role: ERole;
}

export class CmsUpdateUserDto extends PartialType(CmsCreateUserDto) {}

export class ActiveUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value && value?.toLowerCase?.() === 'true')
  active: boolean;
}
