import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoService } from './crypto/crypto.service';
import { FileService } from './file/file.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CryptoService, FileService],
})
export class AppModule {}
