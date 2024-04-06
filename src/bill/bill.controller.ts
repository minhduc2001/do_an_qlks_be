import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ERole } from '@/role/enum/roles.enum';
import { StatsService } from './stats.service';
import { StatsRevenueTimeDto } from './dto/stats.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/role/roles.guard';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { Response } from 'express';
import * as moment from 'moment';
import { BadRequest } from '@/base/api/exception.reslover';
import { Auth } from '@/auth/decorator/auth.decorator';
import { Roles } from '@/role/roles.decorator';

@Controller('bill')
@ApiTags('Bill')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class BillController {
  constructor(
    private readonly billService: BillService,
    private readonly statsService: StatsService,
  ) {}

  @Get('stats-service')
  @Roles(ERole.Admin, ERole.Accountant)
  serviceStats(@Query() query: StatsRevenueTimeDto) {
    return this.statsService.serviceStats(query.startDate, query.endDate);
  }

  @Get('stats-room')
  @Roles(ERole.Admin, ERole.Accountant)
  roomStats(@Query() query: StatsRevenueTimeDto) {
    return this.statsService.roomStats(query.startDate, query.endDate);
  }

  @Get('stats-revenue-booking')
  @Roles(ERole.Admin, ERole.Accountant)
  revenueBookingStats(@Query() query: StatsRevenueTimeDto) {
    return this.statsService.revenueStatsBooking(
      query.startDate,
      query.endDate,
    );
  }

  @Get('revenue')
  @Roles(ERole.Admin, ERole.Accountant)
  revenue(@Query('year') year: string) {
    return this.statsService.revenueStats(+year);
  }

  @Get('export-excel-room')
  @Roles(ERole.Admin, ERole.Accountant)
  async exportRoom(
    @Query() query: StatsRevenueTimeDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.statsService.exportRoom(
        query.startDate,
        query.endDate,
        user,
      );

      const filename = `${moment().format('DD-MM-YYYY')}-export.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      res.send(buffer);
    } catch (error) {
      console.log(error);

      throw new BadRequest({ message: 'Lỗi xuất file' });
    }
    return;
  }

  @Get('export-excel-service')
  @Roles(ERole.Admin, ERole.Accountant)
  async exportService(
    @Query() query: StatsRevenueTimeDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.statsService.exportService(
        query.startDate,
        query.endDate,
        user,
      );

      const filename = `${moment().format('DD-MM-YYYY')}-export.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      res.send(buffer);
    } catch (error) {
      console.log(error);

      throw new BadRequest({ message: 'Lỗi xuất file' });
    }
  }

  @Get('export-excel-revenue')
  @Roles(ERole.Admin, ERole.Accountant)
  async export(
    @Query('year') year: string,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.statsService.exportRevenue(+year, user);

      const filename = `${moment().format('DD-MM-YYYY')}-export.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      res.send(buffer);
    } catch (error) {
      console.log(error);

      throw new BadRequest({ message: 'Lỗi xuất file' });
    }
  }

  @Get('export-excel')
  async exportExcel(
    @Query() query: StatsRevenueTimeDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.statsService.exportExcel(
        query.startDate,
        query.endDate,
        user,
      );

      const filename = `${moment().format('DD-MM-YYYY')}-export.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      res.send(buffer);
    } catch (error) {
      throw new BadRequest({ message: 'Lỗi xuất file', errorCode: '666' });
    }
  }
}
