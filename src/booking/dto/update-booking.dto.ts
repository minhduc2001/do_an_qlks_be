import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { ToNumber } from '@/base/decorators/common.decorator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {}

export class AddServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @ToNumber()
  service_id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  @ToNumber()
  quantity: number;
}
