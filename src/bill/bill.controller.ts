import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/role/roles.decorator';
import { ERole } from '@/role/enum/roles.enum';
import { StatsService } from './stats.service';
import { StatsRevenueTimeDto } from './dto/stats.dto';

@Controller('bill')
@ApiTags('Bill')
@ApiBearerAuth()
export class BillController {
  constructor(
    private readonly billService: BillService,
    private readonly statsService: StatsService,
  ) {}

  // @Post()
  // create(@Body() createBillDto: CreateBillDto) {
  //   return this.billService.create(createBillDto);
  // }

  @Get()
  @Roles(ERole.Admin, ERole.Accountant)
  serviceStats(@Param() param: StatsRevenueTimeDto) {
    return this.statsService.serviceStats(param.start_date, param.end_date);
  }

  @Get()
  findAll() {
    return this.billService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billService.update(+id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billService.remove(+id);
  }
}
