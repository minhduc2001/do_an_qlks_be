import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// BASE
import { LoggerModule } from '@base/logger/logger.module';
import { dbConfig } from '@base/db/db.config';
import { MailerModule } from '@base/mailer/mailer.module';

// APPS
import { UserModule } from '@/user/user.module';
import { AuthModule } from '@/auth/auth.module';
import { RoleModule } from '@/role/role.module';

// SHARED
import { SeedersModule } from '@shared/seeder/seeder.module';
import { BookingModule } from './booking/booking.module';
import { RoomModule } from './room/room.module';
import { PromotionModule } from './promotion/promotion.module';
import { CustomerModule } from './customer/customer.module';
import { ServicesModule } from './services/services.module';

import { BillModule } from './bill/bill.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadFileModule } from './base/multer/upload-file.module';

const appModule = [AuthModule, UserModule, RoleModule, MailerModule];
const baseModule = [LoggerModule, UploadFileModule];

@Module({
  imports: [
    CacheModule.register(),
    ...baseModule,
    ...appModule,
    TypeOrmModule.forRoot(dbConfig),
    SeedersModule,
    BookingModule,
    RoomModule,
    PromotionModule,
    CustomerModule,
    ServicesModule,
    BillModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
