import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListDto } from '@/shared/dtos/common.dto';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { CheckRoomExitsDto } from './dto/check-room-exsits.dto';
import { Public } from '@/auth/decorator/public.decorator';

@ApiTags('Booking')
@Controller('booking')
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() payload: CreateBookingDto, @GetUser() user: User) {
    return this.bookingService.create(payload, user);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(+id);
  }
}
