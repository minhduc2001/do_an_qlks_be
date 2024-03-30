import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

// APPS
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/role/roles.decorator';
import { ERole } from '@/role/enum/roles.enum';
import { Public } from '@/auth/decorator/public.decorator';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { ListUserDto, UpdateUserDto, UploadAvatarDto } from './dtos/user.dto';
import { Permissions } from '@/role/permission.decorator';
import { PERMISSIONS } from '@shared/constants/permission.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '@/base/multer/upload.service';
import {
  ActiveUserDto,
  CmsCreateUserDto,
  CmsUpdateUserDto,
} from './dtos/create-user.dto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @Get()
  @Roles(ERole.Admin)
  // @Permissions(PERMISSIONS.DELETE_USER)
  getAllUser(@Query() query: ListUserDto) {
    return this.userService.getAllUser(query);
  }

  @Post()
  async cmsCreateUser(@Body() payload: CmsCreateUserDto) {
    return this.userService.cmsCreateUser(payload);
  }

  @Put('active/:id')
  async avtive(@Param('id') id: string, @Body() payload: ActiveUserDto) {
    return this.userService.active(+id, payload);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.userService.update(+id, payload);
  }

  @Put(':id/cms')
  async updateCms(@Param('id') id: string, @Body() payload: CmsUpdateUserDto) {
    return this.userService.cmsUpdateUser(+id, payload);
  }

  @Patch('avatar/:id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.uploadService.uploadFile(file);
    return this.userService.uploadAvatar(+id, url);
  }
}
