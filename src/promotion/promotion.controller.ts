import { UploadService } from '@/base/multer/upload.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/decorator/public.decorator';
import { ListDto } from '@/shared/dtos/common.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { ActivePromotionDto } from './dto/active-promotion.dto';
import { JwtAnonymousGuard } from '@/auth/guard/jwt-anonymous.guard';

@ApiTags('Promotion')
@Controller('promotion')
@ApiBearerAuth()
@UseGuards(JwtAnonymousGuard)
export class PromotionController {
  constructor(
    private readonly promotionService: PromotionService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() payload: CreatePromotionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const urlFile = file && (await this.uploadService.uploadFile(file));
    return this.promotionService.create({ ...payload, file: urlFile });
  }

  @Get()
  findAll(@Query() query: ListDto) {
    return this.promotionService.findAll(query);
  }

  @Get('find')
  @Public()
  findAllForUser(@Query() query: ListDto) {
    return this.promotionService.findAllForUser(query);
  }

  @Get(':identity')
  @Public()
  findOne(@Param('identity') identity: string) {
    return this.promotionService.findOne(identity);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: UpdatePromotionDto) {
    return this.promotionService.update(+id, payload);
  }

  @Patch(':id')
  active(@Param('id') id: string, @Body() payload: ActivePromotionDto) {
    return this.promotionService.active(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(+id);
  }
}
