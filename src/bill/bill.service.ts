import { Injectable } from '@nestjs/common';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { EPaymentState, EPaymentType, ICreateBill } from './bill.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Bill } from './entities/bill.entity';
import { Repository } from 'typeorm';
import { BaseService } from '@/base/service/base.service';
import { VnpayService } from './vn-pay.service';
import { generateUUID } from '@/base/helper/function.helper';

@Injectable()
export class BillService extends BaseService<Bill> {
  constructor(
    @InjectRepository(Bill)
    protected readonly repository: Repository<Bill>,
    private readonly vnpayService: VnpayService,
  ) {
    super(repository);
  }
  async create(payload: ICreateBill) {
    const { booking, amount, payment_type } = payload;

    const bill = this.repository.create();
    bill.amount = amount;
    bill.payment_type = payment_type;
    bill.booking = booking;
    bill.order_id = generateUUID();

    let url = null;
    try {
      switch (payment_type) {
        case EPaymentType.Vnpay: {
          url = await this.vnpayService.createPayment({
            orderId: bill.order_id,
            amount: amount,
          });
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      bill.payment_state = EPaymentState.Reject;
    }

    await bill.save();
    return url.payUrl;
  }

  findAll() {
    return `This action returns all bill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bill`;
  }

  update(id: number, updateBillDto: UpdateBillDto) {
    return `This action updates a #${id} bill`;
  }

  remove(id: number) {
    return `This action removes a #${id} bill`;
  }
}
