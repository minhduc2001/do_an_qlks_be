import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FeatureRoom } from '@/room/entities/feature_room.entity';
const data = `Bàn làm việc,Két an toàn,Sàn lát gỗ,TV màn hình phẳng,Đồng hồ báo thức,Sách, đĩa DVD và nhạc cho trẻ em,Khu vực tiếp khách,Dịch vụ streaming (như là Netflix),Lối vào riêng,Giường sofa,Máy sấy quần áo,Truyền hình cáp,Sản phẩm lau rửa,Điều hòa không khí,Giá treo quần áo,Các tầng trên đi lên bằng thang máy,Các tầng trên chỉ lên được bằng cầu thang,Giường cực dài (> 2 mét),Quyền sử dụng Executive Lounge,Dịch vụ báo thức,Ghế sofa,Khăn tắm,Ổ điện gần giường,Tiện nghi BBQ,Tủ lạnh,Minibar,Ấm đun nước điện,Điện thoại,Cửa an toàn cho trẻ nhỏ,Tủ hoặc phòng để quần áo,Khu vực ăn uống ngoài trời,Hệ thống cách âm,Truyền hình vệ tinh,Có phòng thông nhau qua cửa nối,Khu vực phòng ăn,Nước rửa tay`;

@Injectable()
export class FeatureRoomSeed {
  constructor(
    @InjectRepository(FeatureRoom)
    protected readonly repository: Repository<FeatureRoom>,
  ) {}

  async seed() {
    const count = await this.repository.count();
    if (!count) {
      for (const fr of data.split(',')) {
        await this.repository.save({ name: fr } as FeatureRoom);
      }
    }
  }
}
