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
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ListServiceDto } from './dto/list-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Service')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() payload: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.servicesService.create({ ...payload, file: file.filename });
  }

  @Get()
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
  update(@Param('id') id: string, @Body() payload: UpdateServiceDto) {
    return this.servicesService.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
