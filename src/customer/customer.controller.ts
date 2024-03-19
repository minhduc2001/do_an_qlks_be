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
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListCustomerDto } from './dto/list-customer.dto';
import { Public } from '@/auth/decorator/public.decorator';

@ApiTags('Customer')
@Controller('customer')
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @Public()
  findAll(@Query() query: ListCustomerDto) {
    return this.customerService.findAll(query);
  }

  @Post('/mail')
  findEmail(@Body() payload: { email: string }) {
    return this.customerService.findEmail(payload.email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() payload: UpdateCustomerDto) {
    return this.customerService.update(+id, payload);
  }
}
