import { Injectable } from '@nestjs/common';
import admin, { ServiceAccount } from 'firebase-admin';
import * as path from 'path';

import * as serviceAccount from 'firebase-key.json';
import { generateUUID, makeUUID } from '../helper/function.helper';
import { config } from '@/config';

@Injectable()
export class UploadService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
      storageBucket: config.STOGARE_BUCKET,
    });
  }

  async uploadFile(bufferFile: Express.Multer.File, folder: string = '') {
    const filename = makeUUID(bufferFile.originalname);
    const bucket = admin.storage().bucket();
    await bucket.file(filename).save(bufferFile.buffer);
    return this.getUrlFile(filename, bucket);
  }

  async uploadMultipeFile(files: Array<Express.Multer.File>) {
    const promises = files.map(async (file) => {
      return await this.uploadFile(file);
    });

    return await Promise.all(promises);
  }

  async getUrlFile(filePath: string, bucketTemplate?: any) {
    const bucket = bucketTemplate || admin.storage().bucket();
    const file = bucket.file(filePath);

    const publicUrl = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2100',
    });

    return publicUrl[0];
  }
}
