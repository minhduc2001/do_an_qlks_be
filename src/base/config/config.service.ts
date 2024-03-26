import { Injectable } from '@nestjs/common';
import * as ip from 'ip';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

const _process = { env: process.env };
process.env = {};

@Injectable()
export class ConfigService {
  FIXED_STATUS_CODE =
    (_process.env.SENTRY_LOG ?? 'true').toLowerCase() === 'true';
  DEBUG = (_process.env.DEBUG ?? 'false').toLowerCase() !== 'false';

  PORT = _process.env.PORT ?? 8080;

  IP = ip.address();
  API_VERSION = '1';

  // db
  DB_DATABASE = _process.env.DB_DATABASE;
  DB_PASSWORD = _process.env.DB_PASSWORD;
  DB_USERNAME = _process.env.DB_USERNAME;
  DB_HOST = _process.env.DB_HOST;
  DB_PORT = Number(_process.env.DB_PORT);
  DB_SSL = !!_process.env.DB_SSL;

  // jwt
  JWT_SECRET = _process.env.JWT_SECRET;
  JWT_RT_SECRET = _process.env.JWT_RT_SECRET;

  // mailer
  EMAIL = _process.env.EMAIL;
  MAIL_PASSWORD = _process.env.MAIL_PASSWORD;

  // file
  MAX_FILE_SIZE = 10000000; // 10MB;
  UPLOAD_LOCATION = 'uploads';

  // firebase
  STOGARE_BUCKET = _process.env.STOGARE_BUCKET;

  VNP_TMNCODE = _process.env.VNP_TMNCODE;
  VNP_HASH_SECRET = _process.env.VNP_HASH_SECRET;
  VNP_URL = _process.env.VNP_URL;
  VNP_API = _process.env.VNP_API;
  VNP_RETURN_URL = _process.env.VNP_RETURN_URL;

  // momo
  MOMO = {
    PARTNER_CODE: _process.env.PARTNER_CODE,
    ACCESS_KEY: _process.env.ACCESS_KEY,
    SECRET_KEY: _process.env.SECRET_KEY,
    ENVIROMENT: _process.env.ENVIROMENT || 'enviroment',
  };
}

export const config = new ConfigService();
