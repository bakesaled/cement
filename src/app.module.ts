import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoService } from '@bakesaled/cement';
import { FileService } from '@bakesaled/cement';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CryptoService, FileService],
})
export class AppModule {}
