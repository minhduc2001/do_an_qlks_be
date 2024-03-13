import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from '@base/multer/multer.config';
import { UploadService } from './upload.service';

@Global()
@Module({
  imports: [MulterModule.register(multerOptions)],
  providers: [UploadService],
  exports: [MulterModule, UploadService],
})
export class UploadFileModule {}
