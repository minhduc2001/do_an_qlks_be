import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ListServiceDto } from './dto/list-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '@/base/multer/upload.service';
import { Public } from '@/auth/decorator/public.decorator';
import { ActiveServiceDto } from './dto/active-service.dto';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { JwtAnonymousGuard } from '@/auth/guard/jwt-anonymous.guard';

@ApiTags('Service')
@Controller('services')
@ApiBearerAuth()
@UseGuards(JwtAnonymousGuard)
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() payload: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const urlFile = await this.uploadService.uploadFile(file);
    return this.servicesService.create({ ...payload, file: urlFile });
  }

  @Get()
  findAll(@Query() query: ListServiceDto) {
    return this.servicesService.findAll(query);
  }

  @Get('find')
  @Public()
  findAllForUser(@Query() query: ListServiceDto) {
    return this.servicesService.findAllForUser(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const urlFile = file && (await this.uploadService.uploadFile(file));
    return this.servicesService.update(+id, { ...payload, file: urlFile });
  }

  @Patch(':id')
  active(@Param('id') id: string, @Body() payload: ActiveServiceDto) {
    return this.servicesService.active(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
