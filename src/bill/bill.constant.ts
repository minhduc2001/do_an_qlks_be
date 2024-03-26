import { Booking } from '@/booking/entities/booking.entity';

export enum EPaymentType {
  Momo,
  Vnpay,
  Zalopay,
  Cash,
}

export enum EPaymentState {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Reject = 'reject',
}

export enum EPaymentFor {
  Service = 'service',
  Room = 'room',
}

export interface ICreateBill {
  booking: Booking;
  amount: number;
  payment_type: EPaymentType;
}
