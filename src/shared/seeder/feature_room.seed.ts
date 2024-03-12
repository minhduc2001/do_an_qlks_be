import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRoom } from '@/room/entities/feature_room.entity';

const data = [
  'Thuế GTGT và phí phục vụ.',
  'Nước Welcom khi check – in.',
  'Miễn phí nước lọc, trà và cà phê.',
  'Miễn phí bữa ăn sáng tự chọn tại nhà hàng từ 6 giờ đến 9 giờ sáng.',
  'Miễn phí xe buýt đón tiễn khách từ bến xe/ gà tàu Ninh Bình.',
  'Hỗ trợ set up phòng Honney Moon miễn phí.',
  'Miễn phí sử dụng bể bơi ngoài trời, bể bơi trong nhà và bể bơi vô cực.',
  'Bãi đỗ xe miễn phí.',
  'Miễn phí sử dụng phòng đọc sách, phòng tập thể dục.',
  'Miễn phí sử dụng Internet Wifi.',
];
@Injectable()
export class FeatureRoomSeed {
  constructor(
    @InjectRepository(FeatureRoom)
    protected readonly repository: Repository<FeatureRoom>,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (!count) {
      for (const fr of data) {
        await this.repository.save({ name: fr } as FeatureRoom);
      }
    }
  }
}
