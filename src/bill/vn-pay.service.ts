import { Injectable } from '@nestjs/common';
import { config } from '@/config';
import * as moment from 'moment';
import * as querystring from 'qs';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class VnpayService {
  constructor() {}

  async createPayment(dataBody: {
    orderId: string;
    bankCode?: string;
    amount: number;
    language?: string;
  }) {
    const tmnCode = config.VNP_TMNCODE.trim();
    const secretKey = config.VNP_HASH_SECRET.trim();

    let vnpUrl = config.VNP_URL;
    const returnUrl = config.VNP_RETURN_URL;
    const orderId = dataBody.orderId;
    const amount = dataBody.amount;
    const bankCode = dataBody?.bankCode;
    const ipAddr = '%3A%3A1';

    const locale = dataBody?.language ?? 'vi';

    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss');
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);
    const signData = querystring.stringify(vnp_Params, { encode: false });

    const hmac = crypto.createHmac('sha512', secretKey);
    const buffer = Buffer.from(signData, 'utf-8');
    const signed = hmac.update(buffer).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return { payUrl: vnpUrl };
  }

  sortObject(obj: any) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
