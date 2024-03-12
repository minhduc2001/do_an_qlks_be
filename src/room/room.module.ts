import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { TypeRoom } from './entities/type_room.entity';
import { FeatureRoom } from './entities/feature_room.entity';
import { TypeRoomService } from './type_room.service';
import { FeatureRoomService } from './feature_room.service';

@Module({
  imports: [TypeOrmModule.forFeature([Room, TypeRoom, FeatureRoom])],
  controllers: [RoomController],
  providers: [RoomService, TypeRoomService, FeatureRoomService],
})
export class RoomModule {}
