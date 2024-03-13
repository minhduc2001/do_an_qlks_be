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
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ListServiceDto } from './dto/list-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '@/base/multer/upload.service';
import { Public } from '@/auth/decorator/public.decorator';

@ApiTags('Service')
@Controller('services')
@ApiBearerAuth()
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
  @Public()
  findAll(@Query() query: ListServiceDto) {
    return this.servicesService.findAll(query);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
