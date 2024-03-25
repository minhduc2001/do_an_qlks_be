import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
  CmsCreateBookingDto,
  CreateBookingDto,
} from './dto/create-booking.dto';
import { AddServiceDto, UpdateBookingDto } from './dto/update-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListDto } from '@/shared/dtos/common.dto';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { CheckRoomExitsDto } from './dto/check-room-exsits.dto';
import { Public } from '@/auth/decorator/public.decorator';
import { Response } from 'express';
import * as moment from 'moment';
import { BadExcetion, BadRequest } from '@/base/api/exception.reslover';

@ApiTags('Booking')
@Controller('booking')
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() payload: CreateBookingDto, @GetUser() user: User) {
    return this.bookingService.create(payload, user);
  }

  @Post('cms')
  adminCreate(@Body() payload: CmsCreateBookingDto, @GetUser() user: User) {
    return this.bookingService.cmsCreate(payload, user);
  }

  @Post('check')
  @Public()
  checkRoomExits(@Body() payload: CheckRoomExitsDto) {
    return this.bookingService.checkRoomExits(payload);
  }

  @Get()
  findAll(@Query() query: ListDto) {
    return this.bookingService.findAll(query);
  }

  @Get('export-bill/:id')
  async export(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.bookingService.export(+id);
      const filename = `${moment().format('DDMMYYYY')}-invoice.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      res.send(pdfBuffer);
    } catch (error) {
      throw new BadRequest({ message: 'Lỗi xuất file' });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id/add-service')
  addService(@Param('id') id: string, @Body() payload: AddServiceDto[]) {
    return this.bookingService.addService(+id, payload);
  }

  @Patch('checkin/:id')
  checkin(@Param('id') id: string) {
    return this.bookingService.checkin(+id);
  }

  @Patch('checkout/:id')
  checkout(@Param('id') id: string) {
    return this.bookingService.checkout(+id);
  }

  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.bookingService.cancel(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}
