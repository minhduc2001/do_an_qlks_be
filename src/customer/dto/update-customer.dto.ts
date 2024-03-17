import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '@/base/decorators/common.decorator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty()
  @IsNotEmpty()
  @Trim()
  @IsString()
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @Trim()
  @IsString()
  phone: string;
}
