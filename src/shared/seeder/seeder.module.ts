import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { SeederService } from '@shared/seeder/seeder.service';
import { UserSeed } from '@shared/seeder/user.seed';
import { Permission } from '@/role/entities/permission.entity';
import { PermissionSeed } from '@shared/seeder/permission.seed';
import { FeatureRoomSeed } from './feature_room.seed';
import { FeatureRoom } from '@/room/entities/feature_room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Permission, FeatureRoom])],
  providers: [SeederService, UserSeed, FeatureRoomSeed],
})
export class SeedersModule {}
